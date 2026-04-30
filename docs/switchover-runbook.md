# Switchover Runbook — `nueva.avanzosc.es` → `avanzosc.es`

**Estado**: pendiente ejecución por administradores Avanzosc tras
cierre de gates Q1 + Q3 + spec §13. Phase 10.6 del plan v1.

**Audiencia**: sysadmin Avanzosc + responsable web Avanzosc. Este
runbook está escrito para ser ejecutable por alguien que no haya
implementado el módulo — instrucciones paso a paso con comandos
exactos, verificación posterior y tiempo estimado.

**Versión runbook**: 1.0 (sesión 2026-04-29 Phase 10.5).

---

## 0. Pre-checks (gates humanos pendientes)

**ANTES de iniciar cualquier paso del runbook**, confirmar:

- [ ] **Q1 cerrada — Validación lingüística DRAFTs**
  - Runbook: `docs/q1-validation-runbook.md`.
  - Verificación: `grep -c "# DRAFT - REVIEW NEEDED" i18n/eu.po` → **0**.
  - Verificación: `grep -c "^#, fuzzy" i18n/eu.po` → **0**.
  - Responsable: equipo Avanzosc lingüístico.
- [ ] **Q3 cerrada — Revisión legal páginas legales**
  - Páginas: `/aviso-legal`, `/politica-privacidad`, `/politica-cookies`.
  - Verificación: `grep -c "# LEGAL DRAFT - REVIEW NEEDED" i18n/eu.po` → **0**.
  - Verificación: `grep -rn "LEGAL DRAFT - REVIEW NEEDED BY LEGAL ADVISOR" views/pages/legal_*.xml` → **0**.
  - Responsable: asesoría legal Avanzosc.
- [ ] **Q4 cerrada — Analytics**
  - Decisión: GA4 / Plausible / Matomo / ninguno.
  - Si analytics activado: `views/pages/legal_cookies.xml` actualizado con la cookie correspondiente; banner de consentimiento implementado si aplica.
  - Responsable: dirección Avanzosc.
- [x] **Q5 cerrada — `/blog/*` redirects** (sesión 2026-04-30)
  - Decisión: 301 a `/` (lang-aware ES → `/`, EU → `/eu_ES/`).
  - Implementación: doble cobertura.
    1. Custom controller `WebsiteAvanzoscBlogRedirect` en `controllers/main.py` cubre `/blog` raw + `/blog/<path:rest>` (3+ segments) lang-aware.
    2. 15 entries `website.rewrite` específicas en `data/redirects.xml` para los URLs reales del sitemap legacy avanzosc.es (1 categoría `/blog/odoo-1` + 14 artículos `/blog/odoo-1/<slug>`). Necesarias porque `website_blog` (Odoo, instalado pero invisible per CLAUDE.md §11) hijack rutas con converters específicos.
  - Verificación post-switchover: `curl -I https://avanzosc.es/blog` → 301 → `/`. `curl -I https://avanzosc.es/blog/odoo-1/contabilidad-en-odoo-80` → 301 → `/`.
  - Trade-offs conocidos: 2 URLs específicas (`/blog/odoo-1`, `/blog/odoo-1/feed`) hacen hop intermedio a `/blog/travel-1*` (blog default Odoo demo) por hijack de website_blog before `_serve_redirect`. URLs no críticas (categoría + feed RSS), aceptado v1. `/blog/` (trailing slash) hace 2-hop chain `/blog/→/blog→/` por strip de Odoo. SEO leve, aceptado.
- [x] **Q6 cerrada — `/page/kit-digital` antiguo** (sesión 2026-04-30)
  - Decisión: 301 a `/#kit-consulting` (anchor en home, snippet `s_avanzosc_cta_kit_consulting`).
  - Hallazgo de inventario: `/page/kit-digital` NO existe en avanzosc.es legacy (curl 404, ausente de sitemap.xml). Redirect defensivo para bookmarks externos hipotéticos.
  - Implementación: 2 entries `website.rewrite` en `data/redirects.xml` (ES + EU separados, patrón consistente con `redirect_eu_slug_*`).
  - Anchor `id="kit-consulting"` añadido al `<section>` del snippet en mismo commit.
  - Verificación: `curl -I /page/kit-digital` → 301 → `/#kit-consulting`. `curl -I /eu_ES/page/kit-digital` → 301 → `/eu_ES/#kit-consulting`.
- [ ] **Q8 cerrada — Sesión fotográfica equipo (no bloqueante v1)**
  - Si decidida: SVG abstract en `views/snippets/equipo.xml` reemplazado por foto real.
  - Si no decidida: aceptado, placeholder SVG se mantiene.
- [ ] **Phase 10.3 ejecutada — Auditoría SEO previa**
  - Documento: `docs/superpowers/plans/audit-seo-pre-switchover.md`.
  - Identifica gaps en redirects vs URLs reales con tráfico.
- [ ] **Hex finales del logo + SVG** (spec §13 #3)
  - SCSS `_variables.scss` actualizado con hex extraídos de logo real.
  - `views/layout.xml` con SVG vectorial limpio (no bitmap).

**Si CUALQUIER pre-check falla**: NO continuar. Volver a la fase
correspondiente del plan y cerrar el gate antes de re-intentar.

---

## 1. Snapshot pre-switchover

**Tiempo estimado**: 15-30 min.
**Ejecuta**: sysadmin Avanzosc.

### 1.1 — Backup BBDD productiva

```bash
# Sustituir <ruta-backup> por path con suficiente espacio.
# La BBDD se llama `odoo14_community` per CLAUDE.md §7.
sudo -u postgres pg_dump -Fc odoo14_community > <ruta-backup>/odoo14_community-pre-switchover-$(date +%Y%m%d-%H%M%S).dump
```

**Verificación**: el archivo `.dump` tiene tamaño > 100 MB y `pg_restore --list` lo lee sin errores.

### 1.2 — Backup config Odoo

```bash
sudo cp /etc/odoo/odoo14_community.conf <ruta-backup>/odoo14_community.conf.pre-switchover
sudo cp -r /opt/odoo/v14/.local/share/Odoo/filestore/odoo14_community <ruta-backup>/filestore-pre-switchover
```

**Verificación**: ambos backups existen, filestore tiene los attachments
y la conf tiene `addons_path`, `db_name`, `dbfilter` correctos.

### 1.3 — Tag git en feature/v1-implementation

```bash
cd /opt/odoo/v14/workspace/website_avanzosc_demo
git tag v1.0.0-pre-switchover
git push origin v1.0.0-pre-switchover
```

**Verificación**: `git show v1.0.0-pre-switchover` devuelve el commit
HEAD actual; en GitHub la tag aparece bajo «Tags».

---

## 2. DNS / dominio

**Tiempo estimado**: 5 min ejecución + 1-48h propagación DNS.
**Ejecuta**: responsable DNS Avanzosc (registrador del dominio).

### 2.1 — Cambiar registro A/AAAA de `avanzosc.es`

Apuntar `avanzosc.es` (root) y `www.avanzosc.es` al servidor Odoo donde
hoy sirve `nueva.avanzosc.es`. Mismo IP que el subdominio QA.

```
A     avanzosc.es        → <IP-servidor-Odoo>
A     www.avanzosc.es    → <IP-servidor-Odoo>  (o CNAME a avanzosc.es)
```

**Verificación**: `dig +short avanzosc.es @8.8.8.8` devuelve la IP del
servidor Odoo. TTL bajo (~300s) recomendado durante la fase de
propagación.

### 2.2 — Decisión sobre `nueva.avanzosc.es`

**Mantener** activo durante 30 días post-switchover como entorno de
fallback (rollback rápido si algo va mal). Despublicar después.

Para «despublicar» la URL pero mantener el servidor: cambiar el DNS de
`nueva.avanzosc.es` a un IP que devuelva 410 Gone, o eliminar el
registro DNS completamente.

---

## 3. Cambio de dominio en código

**Tiempo estimado**: 30 min.
**Ejecuta**: dev Avanzosc.

### 3.1 — Sitemap.xml + robots.txt: dynamic domain

El controller `controllers/main.py` usa `request.httprequest.url_root`
dinámicamente. **NO requiere cambios** al pasar de `nueva.avanzosc.es`
a `avanzosc.es` — el sitemap y robots se auto-actualizan al dominio
desde el que se sirvan.

**Verificación post-DNS**: `curl https://avanzosc.es/sitemap.xml` muestra
URLs con prefijo `https://avanzosc.es/` (no `nueva.avanzosc.es`).

### 3.2 — Buscar dominio hardcoded

```bash
cd /opt/odoo/v14/workspace/website_avanzosc_demo
grep -rn "nueva.avanzosc.es" --exclude-dir=.git
```

**Resultado esperado** post-runbook v1.0:
- `docs/switchover-runbook.md` (este archivo) — referencias documentales OK.
- `docs/q1-validation-runbook.md` — referencias documentales OK.
- Nada en `data/`, `views/`, `static/`, `controllers/`, `models/`, `i18n/`.

Si el grep encuentra hardcodes operativos (no docs), commit dedicado:

```bash
git checkout -b switchover/domain-swap
# Editar archivos para cambiar nueva.avanzosc.es → avanzosc.es
# (revisar cada match individualmente)
git add .
git commit -m "[FIX] switchover: nueva.avanzosc.es → avanzosc.es in <ficheros>"
git push origin switchover/domain-swap
# Merge a feature/v1-implementation o main per workflow Avanzosc.
```

### 3.3 — Robots.txt: cambio Disallow → Allow

Editar `controllers/main.py`, función `robots()`:

```python
# ANTES (durante QA):
'User-agent: *\n'
'Disallow: /\n'

# DESPUÉS (post-switchover, indexación habilitada):
'User-agent: *\n'
'Disallow: /web/\n'      # Bloquear backend
'Disallow: /my/\n'       # Bloquear portal cliente
'Allow: /\n'             # Resto indexable
```

**O mejor**: eliminar el override completo de `robots()` para que el
built-in de Odoo use el field `website.robots_txt` editable desde
Settings → Website. Ese path da más flexibilidad post-switchover.

Commit:

```bash
git add controllers/main.py
git commit -m "[FIX] switchover: robots.txt Disallow → Allow + targeted backend disallow"
git push origin <rama>
```

### 3.4 — Re-instalar/actualizar el módulo en producción

```bash
sudo systemctl stop odoo14
sudo -u odoo /opt/odoo/v14/venv/bin/python /opt/odoo/v14/base/odoo-bin \
  -c /etc/odoo/odoo14_community.conf \
  -u website_avanzosc_demo \
  -d odoo14_community \
  --stop-after-init
sudo systemctl start odoo14
```

**Verificación**: `journalctl -u odoo14 -n 50 -f` no muestra tracebacks
ni errores; `curl -I https://avanzosc.es/` devuelve 200.

### 3.5 — Verificación form `/contacto` post-deploy (SMTP real)

**Tiempo estimado**: 5 min.
**Ejecuta**: sysadmin Avanzosc.

En dev local SMTP no está configurado: el form `/contacto/submit` crea un
`mail.mail` con `state='exception'` (decisión `WebsiteAvanzoscContact`
controller con try/except defensivo, UX al usuario sigue siendo
confirmación per D18). En producción con SMTP configurado, el state debe
ser `sent` tras el envío real. Verificar:

1. Hacer un submit válido al form de `https://avanzosc.es/contacto`
   (campo `nombre`, `email` propio, `empresa`, `mensaje`, marcar checkbox
   privacidad). Submit.

2. Confirmar redirect a `/contacto/gracias` y mensaje «¡Gracias!» visible.

3. Confirmar email recibido en bandeja `comercial@avanzosc.es`.

4. Verificar el record `mail.mail` con state correcto:
   ```sql
   SELECT m.id, msg.subject, m.state, m.create_date
   FROM mail_mail m
   JOIN mail_message msg ON msg.id = m.mail_message_id
   WHERE msg.subject ILIKE '[Web] Consulta%'
   ORDER BY m.id DESC LIMIT 5;
   ```
   **Esperado**: `state='sent'` (NO `exception` ni `outgoing`).

5. Si el state queda `exception`: revisar logs Odoo para el traceback
   del envío (typical: SMTP credentials mal configurados, o `mail.host`
   no resuelve). Resolver antes de seguir.

6. Repetir el submit en `/eu_ES/contacto` para confirmar que el redirect
   lang-aware funciona (debe llegar a `/eu_ES/contacto/gracias`) y que
   el mail body contiene `Idioma: eu_ES`.

---

## 4. Robots.txt verificación post-DNS

**Tiempo estimado**: 5 min (post-propagación DNS completa).
**Ejecuta**: sysadmin Avanzosc.

```bash
curl -s https://avanzosc.es/robots.txt
```

**Esperado**: contenido con `Allow: /` y `Sitemap: https://avanzosc.es/sitemap.xml`. Sin la palabra `Disallow: /`.

```bash
curl -s https://avanzosc.es/sitemap.xml | head -10
```

**Esperado**: `<urlset>` con URLs `https://avanzosc.es/...` (no
localhost ni nueva).

---

## 5. Notificaciones SEO

**Tiempo estimado**: 30 min ejecución + monitoreo continuo 30 días.
**Ejecuta**: responsable SEO Avanzosc.

### 5.1 — Submit sitemap a Google Search Console

1. Login a https://search.google.com/search-console.
2. Add property: `https://avanzosc.es` (DNS verification).
3. En el sidebar: «Sitemaps» → submit URL: `https://avanzosc.es/sitemap.xml`.
4. Esperar 24-48h para que GSC procese el sitemap inicial.

### 5.2 — Cambio de dominio en GSC (si la propiedad antigua existe)

Si existía una property GSC para `https://avanzosc.es` antes (en el
servidor legacy), usar la herramienta «Cambio de dirección» (Settings →
Change of address). Esto preserva el ranking acumulado del dominio.

### 5.3 — Monitor 404s en logs (30 días)

```bash
# En el servidor Odoo, scriptable diario.
sudo grep "GET .* 404" /var/log/odoo/odoo14.log | grep -v "/favicon.ico\|/web/static" | sort | uniq -c | sort -rn | head -20
```

**Si aparecen 404s recurrentes en URLs legacy** (e.g. `/page/X`, `/blog/...`):
- Añadir el redirect correspondiente en `data/redirects.xml`.
- Re-update el módulo.
- Verificar el redirect funciona.

---

## 6. Limpieza post-switchover

**Tiempo estimado**: 30 días después del switchover.
**Ejecuta**: sysadmin Avanzosc.

### 6.1 — Despublicar `nueva.avanzosc.es`

Tras 30 días sin issues, eliminar el registro DNS de
`nueva.avanzosc.es` (subdominio QA):

```
# En el panel del registrador del dominio:
DELETE A nueva.avanzosc.es
```

### 6.2 — Re-tag git en main

Si la rama `feature/v1-implementation` se mergea a `main`:

```bash
git checkout main
git merge feature/v1-implementation
git tag v1.0.0-production
git push origin main v1.0.0-production
```

---

## 7. Rollback procedure (si algo va mal en las primeras 24-48h)

**Tiempo estimado**: 5-10 min.
**Ejecuta**: sysadmin + DNS Avanzosc en colaboración.

### 7.1 — Reactivar `nueva.avanzosc.es` como dominio principal temporal

```
# DNS (registrador del dominio):
A     avanzosc.es     → IP-anterior-servidor   (pre-switchover)
# Mantener nueva.avanzosc.es apuntando al Odoo actual.
```

Comunicación a equipo Avanzosc: el switchover queda revertido; los
visitantes que cayeron en el nuevo `avanzosc.es` durante la ventana de
propagación verán la web nueva, pero los que ya cachearon la dirección
antigua siguen recibiendo la legacy.

### 7.2 — Restore BBDD si data corrupted

```bash
sudo systemctl stop odoo14
sudo -u postgres dropdb odoo14_community
sudo -u postgres createdb odoo14_community
sudo -u postgres pg_restore -d odoo14_community <ruta-backup>/odoo14_community-pre-switchover-*.dump
sudo cp -r <ruta-backup>/filestore-pre-switchover /opt/odoo/v14/.local/share/Odoo/filestore/odoo14_community
sudo systemctl start odoo14
```

**Verificación**: `curl -I https://nueva.avanzosc.es/` devuelve 200 con
contenido del estado pre-switchover.

### 7.3 — Restaurar tag git

```bash
cd /opt/odoo/v14/workspace/website_avanzosc_demo
git fetch origin --tags
git checkout v1.0.0-pre-switchover
sudo -u odoo /opt/odoo/v14/venv/bin/python /opt/odoo/v14/base/odoo-bin \
  -c /etc/odoo/odoo14_community.conf \
  -u website_avanzosc_demo \
  -d odoo14_community --stop-after-init
sudo systemctl restart odoo14
```

---

## 8. Sign-off final

Tras completar pasos 1-5 y 7 días sin issues:

- [ ] Sysadmin firma 1.x completas.
- [ ] DNS firma 2.x completas + propagación verificada en >5 ubicaciones geográficas (e.g. https://www.whatsmydns.net).
- [ ] Dev firma 3.x completas + smoke verde post-deploy.
- [ ] SEO firma 5.x completas + GSC reconoce el sitemap submission.
- [ ] **Phase 10.6 (gate final humano) cerrada**.

**v1 cerrada formalmente cuando los 5 sign-offs estén firmados.**

---

## Referencias

- `docs/q1-validation-runbook.md` — gate Q1 cerrar antes de iniciar runbook.
- `docs/superpowers/plans/2026-04-27-website-avanzosc-demo-v1-plan.md` §10 — Phase 10 plan.
- `docs/superpowers/specs/2026-04-27-website-avanzosc-demo-design.md` §12.2 — switchover spec.
- `controllers/main.py` — `/sitemap.xml` y `/robots.txt` controller overrides.
- `data/redirects.xml` — redirects 301 (legacy + EU + bonitos navbar).
- `CLAUDE.md` §11 «Decisiones pendientes» — lista cierre de Q1/Q3/Q4-Q8.
