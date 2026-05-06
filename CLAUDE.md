Nunca operar sobre GitHub (push, branches, PRs, settings, releases) sin autorización explícita en la sesión actual. Las autorizaciones son puntuales y NO se heredan entre sesiones.

# Proyecto: website_avanzosc_demo

Rediseño de **avanzosc.es** (consultora Odoo, Azkoitia). Módulo custom sobre Odoo 14 Community, todo dentro de Odoo, captación B2B.

---

## 1. Quick reference

- **Stack**: Odoo 14 Community + módulo custom + QWeb + SCSS + JS legacy publicWidget (NO ES6 modules) + Bootstrap 5.
- **Librerías CDN**: GSAP core + Splitting + Lenis 1.0.42 + Lucide + IntersectionObserver. ScrollTrigger NO cargado actualmente (retirado commit 61600ff).
- **Idiomas**: ES (raíz `/`) + EU (`/eu_ES/`).
- **Branch activa**: `feature/v1-implementation`.
- **Working dir**: `/opt/odoo/v14/workspace/website_avanzosc_demo`.
- **Dev server**: `http://localhost:14070`.
- **GitHub**: `github.com/AnerAvanzosc/website_avanzosc_demo`.
- **Brand & visual**: ver `docs/brand-guide.md`.
- **Decisiones detalladas**: ver `docs/decisions-log.md`.

---

## 2. Arquitectura y navegación

Tema custom sobre módulos `website` core, mismo dominio/servidor/Odoo:

- **Web corporativa** (inicio, soluciones, conócenos, contacto) → `website_avanzosc_demo`.
- **Tienda** → `website_sale` re-skineada.
- **Formación** → `website_slides` re-skineada.
- **Portal ERP de clientes** → `portal` estándar, botón "Acceso clientes" en header.

Menú principal (orden por prioridad funnel B2B, ver D23 sobre eliminación de «Empleo» post-v1):

1. **Inicio**
2. **Soluciones** (dropdown):
   - Industrial (fabricación, química, alimentaria, mecanizado, textil)
   - Distribución (retail, ecommerce, mayoristas)
   - Servicios (IT, SAT, despachos)
   - Academias y centros educativos
3. **Tienda**
4. **Formación**
5. **Contacto**
6. **Conócenos**

**Fuera del menú principal**: Kit Consulting Red.es (`/kit-consulting`, banner temporal en home), FAQ (integrada en cada página de servicio, no página separada), Acceso clientes (botón arriba-derecha del header).

---

## 3. Reglas de código NO NEGOCIABLES

### XML y vistas
- Toda modificación de vistas existentes con herencia `<xpath>`, nunca reescritura.
- Cada herencia con `inherit_id` explícito y comentario `<!-- -->` explicando el porqué.
- IDs prefijados: `website_avanzosc_demo.snippet_hero`, no `snippet_hero`.

### Assets
Registrar CSS/JS vía **herencia XML** de `web.assets_frontend`, no con el manifest moderno:
```xml
<template id="assets_frontend" inherit_id="web.assets_frontend">
    <xpath expr="." position="inside">
        <link rel="stylesheet" type="text/scss" href="/website_avanzosc_demo/static/src/scss/main.scss"/>
        <script type="text/javascript" src="/website_avanzosc_demo/static/src/js/main.js"/>
    </xpath>
</template>
```
**No usar** `'assets': {'web.assets_frontend': [...]}` del manifest — eso es v15+.

### SCSS
- Variables globales en `static/src/scss/_variables.scss`.
- Un SCSS por snippet/componente, importados desde `main.scss`.
- Sobrescribir variables de Bootstrap **antes** de importar, no después.

### JavaScript
```javascript
odoo.define('website_avanzosc_demo.hero', function (require) {
    'use strict';
    var publicWidget = require('web.public.widget');

    publicWidget.registry.AvanzoscHero = publicWidget.Widget.extend({
        selector: '.s_avanzosc_hero',
        start: function () {
            // ...
            return this._super.apply(this, arguments);
        },
    });
});
```
- `publicWidget` para comportamiento del frontend público.
- Sin `import/export` de ES6. Sin `class X extends Y` moderno de v15+.

### Snippets
- Cada snippet es un template QWeb en `views/snippets/`.
- Prefijo de clase CSS: `s_avanzosc_X`.
- Registro en el builder vía herencia de `website.snippets`.

### Modelos Python
- Heredar con `_inherit = 'model.name'`.
- Campos custom prefijados con `x_avanzosc_`.

---

## 4. Animaciones y UX

### Principios
- Animar **solo** `transform` y `opacity` (GPU). No animar `width`, `height`, `top`, `left`, `margin`.
- Respetar `prefers-reduced-motion`:
  ```scss
  @media (prefers-reduced-motion: reduce) {
      * { animation: none !important; transition: none !important; }
  }
  ```
- Duraciones: 300–600ms microinteracciones, 800–1200ms entradas grandes.
- Easings: `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out expo) entradas; `cubic-bezier(0.7, 0, 0.84, 0)` salidas.

### Patrones aprobados
- Reveal on scroll con IntersectionObserver.
- Hero con entrada orquestada: título SplitText de GSAP (letra a letra), subtítulo fade+slide, CTA con delay.
- Parallax sutil (≤30% desplazamiento) con GSAP ScrollTrigger.
- Smooth scroll con Lenis, respetando anchors internos.
- Contador animado para el "600+ módulos" en la home (IntersectionObserver + interpolación).

### Patrones prohibidos
- Pop-ups de cookies que cubren media pantalla.
- Carruseles automáticos sin pausa al hover.
- Texto letra a letra en párrafos largos (mata legibilidad).
- Scrolljacking (interceptar el scroll del usuario).

---

## 5. Servidor Odoo local

> Setup extendido (MCPs, variables de entorno, formas de configurarlas, flujos de trabajo): [docs/setup.md](docs/setup.md).

**Paths críticos:**

- Venv Python: `/opt/odoo/v14/venv/bin/python` (Python 3.10.12).
- Config: `/etc/odoo/odoo14_community.conf` (NO `/opt/odoo/v14/odoo.conf`).
- BBDD: `odoo14_community`.
- Puerto: `14070`.
- Working dir del módulo: `/opt/odoo/v14/workspace/website_avanzosc_demo`.

**Arrancar dev server** (siempre con `--dev=all`):

```bash
/opt/odoo/v14/venv/bin/python /opt/odoo/v14/base/odoo-bin -c /etc/odoo/odoo14_community.conf --dev=all -d odoo14_community
```

**Update tras añadir archivos / cambiar `__manifest__.py`:**

```bash
/opt/odoo/v14/venv/bin/python /opt/odoo/v14/base/odoo-bin -c /etc/odoo/odoo14_community.conf -u website_avanzosc_demo -d odoo14_community --stop-after-init
```

### Gotchas operacionales (recurrentes)

Patrones que aparecen repetidamente al verificar trabajos en este módulo. Documentados aquí para no re-descubrirlos cada sesión.

**Bundle Odoo se invalida con `-u <module>` — primer request HTTP regenera.** El `run-smoke.sh` ejecuta `-u website_avanzosc_demo --stop-after-init` que dispara `DELETE FROM ir_attachment WHERE id IN (...)` sobre los bundles cacheados (`web.assets_frontend`, `web.assets_frontend_lazy`, etc.). Tras el restart del dev server, el primer request HTTP regenera los bundles con hash nuevo. Si Playwright (u otra herramienta) navega contra el HTML cacheado del request anterior, el `<script src="…/N-old_hash/…js">` apunta a un attachment ya borrado → 404 silencioso → bundle stale. **Patrón**:

```bash
./scripts/run-smoke.sh post-v1-X.Y     # smoke + restart dev server
curl -s http://localhost:14070/ >/dev/null   # forzar regen del bundle
# AHORA Playwright/curl/etc. ven el bundle nuevo
```

**Verificar `mail.mail` vía SQL requiere JOIN con `mail_message`.** En Odoo 14 los campos `subject`, `email_from`, `reply_to` viven en `mail.message`, no en `mail.mail` (que solo tiene `email_to`, `state`, `body_html`, etc.). Query correcta cuando MCP Odoo no esté disponible:

```sql
SELECT m.id, msg.subject, m.email_to, msg.email_from, msg.reply_to,
       m.state, substring(m.body_html, 1, 400)
FROM mail_mail m
JOIN mail_message msg ON msg.id = m.mail_message_id
WHERE msg.subject ILIKE '%…%'
ORDER BY m.id DESC LIMIT 5;
```

Conexión local sin password: `psql -d odoo14_community` (usuario `avanzosc` per `db_user` en `/etc/odoo/odoo14_community.conf`).

**Form action en website-routed controllers va lang-aware automáticamente.** Con `@http.route(..., website=True, multilang=True)` (default) el form action que renderiza QWeb se construye con prefijo de lang: `/contacto/submit` en ES, `/eu_ES/contacto/submit` en EU. El controller debe detectar lang vía `request.lang.code` y construir el redirect lang-aware (no hardcodear `/foo` literal). Detalle en D18.

**SCSS pre-anim opacity:0 es deliberado en este stack.** Los heros animados están en `opacity: 0` por default y el JS los revela. **NO invertir ese patrón** (intentado y descartado en D19): el lazy bundle Odoo carga post-load y el JS init corre 70-150 ms tras el primer paint, demasiado tarde para evitar FOFC visible. La escape valve es `prefers-reduced-motion` (que sí revela el contenido sin esperar JS).

**`website.rewrite` solo soporta wildcards con `redirect_type=308`.** Para 301 con wildcard hace falta controller HTTP custom con `<path:rest>` werkzeug. Verificado en source `addons/website/models/ir_http.py:_serve_redirect` — el lookup es exact-match `url_from = req_page` literal. Detalle del workaround en D21 (Q5 controller `WebsiteAvanzoscBlogRedirect`).

**Bypass por ruta válida (extensión del gotcha anterior).** Si `url_from` corresponde a una ruta que el Werkzeug router considera válida (controller core o de otro módulo, ej. `Home.index` con multilang resolviendo `/<lang>/...`), `_serve_redirect` nunca se consulta y el record `website.rewrite` queda inerte. Verificado empíricamente en D26: `<record url_from="/eu_ES/" url_to="/eu_ES" redirect_type="301">` cargaba a BD pero `curl /eu_ES/` retornaba 200 directo. Solución: controller propio que tome la ruta antes (D21 patrón Q5 `WebsiteAvanzoscBlogRedirect`) o, si la ruta destino del redirect coincidiría con la fuente bajo werkzeug `strict_slashes=False`, override de `ir.http._dispatch` (D26 patrón B4 `models/ir_http.py`) — `_dispatch` corre antes de Werkzeug routing matching y ve `request.httprequest.path` raw del cliente. Caveat: en `_dispatch` `request` es `HttpRequest` bare, NO el wrapper Odoo, por lo que `request.redirect()` lanza `AttributeError` — usar `werkzeug.utils.redirect` directo.

**Odoo strippea fragment (`#anchor`) del `url_to` en `website.rewrite`** al cargar XML a BD. Si el destino debe llevar anchor, repensar el approach (apuntar a la página dedicada en lugar del home con anchor) — verificado empíricamente en D21+D22 al pasar Q6 de `/#kit-consulting` a `/kit-consulting`.

**`url_for` aplica lang prefix automáticamente al render** bajo `request.lang.code`. No hay que duplicar templates ni usar `t-att-href` lang-aware: con `href` literal sin prefijo (e.g. `<a href="/clientes">`), Odoo emite el HTML correcto para cada idioma (`/clientes` en ES, `/eu_ES/clientes` en EU). Patrón verificado en D22 (Q2 alias).

**Cambio de `msgid` en `.po` no propaga con `-u`.** Cuando una entry de `i18n/eu.po` cambia su `msgid` (porque el source ES original cambió en data XML o template), `-u` actualiza la columna `src` de la fila existente en `ir_translation` con el nuevo source pero **conserva el `value` antiguo** (state=`translated` por default tras la primera carga). El render usa la fila vieja → la traducción nueva del `msgstr` no aparece. Intentar `-u --i18n-overwrite` puede fallar con `psycopg2.errors.CardinalityViolation: ON CONFLICT DO UPDATE command cannot affect row a second time` cuando dos `msgid` distintos resuelven al mismo target del upsert.

**Workaround**: antes del `-u`, borrar manualmente la fila stale:

```sql
DELETE FROM ir_translation
WHERE name = 'ir.ui.view,website_meta_description'  -- ajustar al campo real
  AND lang = 'eu_ES'                                  -- ajustar al idioma
  AND res_id IN (SELECT id FROM ir_ui_view WHERE key = 'website_avanzosc_demo.page_X');
```

Después `./scripts/run-smoke.sh ...` re-crea la fila desde el `.po` con el `msgstr` nuevo. Verificación post-fix: `curl` la URL y comprobar el render del campo. **Cuándo aplica**: refinamientos de copy donde se reescribe el source ES (Q1 fase 2, copy creativo final, sprints futuros). Si se repite frecuentemente, formalizar como helper script `scripts/refresh-translation.sh <field> <lang> <view_xmlid>`. **Descubierto** durante amend Sprint B2 al reescribir `/conocenos` meta description (commit `73933f4`).

**`scrollLeft += delta` con `scroll-snap-type: x mandatory` no avanza** — el browser revierte al snap point más cercano tras cada write. Wheel típico (~150px) menor que stride típico entre snaps (~300px) → el track parece congelado. Solución snap-aware: `element.scrollIntoView({inline: 'center'})` sobre el item destino — el browser respeta el snap y anima el scroll suavemente. Descubierto durante Pieza D + mejora wheel (revert 827ec78).

**Lenis 1.0.42 SÍ soporta `data-lenis-prevent-wheel`** como atributo HTML en wrapper o ancestor del target wheel. Verificable en source CDN `@studio-freight/lenis@1.0.42/dist/lenis.js`. Información previa errónea (que decía "no soportado en 1.0.42") corregida. Útil cuando Lenis intercepta wheel y se quiere opt-out por elemento sin tocar config global (ej. zona con scroll lateral propio que no debe disparar scroll vertical de la página).

**Chrome/Webkit `scrollWidth` excluye `padding-right`** en contenedores `overflow-x: auto`. Si el contenedor tiene `padding-right` para asomamiento o centrado del último hijo (e.g. `padding: 0 calc(50% - itemWidth/2)`), el `scrollLeft` máximo calculado por `scrollWidth - clientWidth` queda corto vs el valor necesario para centrar el último hijo. Síntoma empírico: desfase visual al final del track aunque el cálculo teórico sea correcto. Solución: animar `transform: translateX` directo en lugar de scroll mecánico, o reposicionar via slots fijos absolute.

**`gsap.from(elem, {...})` deja inline styles** (transform, opacity, etc) tras la animación que ganan por specificity sobre clases CSS de estado (1,0,0,0 inline > 0,0,3,0 selector). Si un patrón mezcla `gsap.from` para reveal stagger inicial + clases CSS posteriores para cambios de estado, las clases no aplican porque el inline style residual del `gsap.from` previo bloquea el cambio. Soluciones: `clearProps: 'all'` en el tween de gsap.from, o skip del `gsap.from` cuando el modo de estado-clases está activo (e.g. dentro de un `if (pinEnabled) return;` antes del reveal stagger).

**axe-core 4.x SÍ factoriza `opacity` en cálculo de color-contrast.** Color con ratio teórico OK (e.g. `--neutral-700` #3A4149 sobre blanco da ~10.5:1) puede fallar AA si el elemento o cualquier ancestor tiene `opacity < 1`. axe computa `blend = color × alpha + background × (1 − alpha)` y mide contrast del resultado vs el background. Las opacities heredan multiplicativamente: parent `opacity:0.5` × child `opacity:0.85` = combined alpha `0.425`. Ejemplo: neutral-700 con opacity 0.5 cae a 2.65:1 efectivo. **Conclusión**: para texto WCAG-strict, diferenciar protagonismo por scale, posición o tamaño tipográfico — NO por opacity baja sobre el texto.

**`website.page` cachea por defecto 3600s con `cache_key=(website_id, lang, path)`** — NO incluye `request.session`, headers ni cookies. Cualquier render condicional por sesión (gating server-authoritative tipo `<t t-if="request.session.get('flag')">`) se almacena en la primera visita y se sirve cacheado a usuarios sin esa sesión, rompiendo el gate. Síntoma: el `t-if` evalúa correctamente la primera vez, pero refresh / URL directa / otra sesión muestran el mismo render. **Fix XML**: `<field name="cache_time" eval="0"/>` en el record de la página. **Fix BD pre-existente**: el record suele estar en `<data noupdate="1">` para preservar `is_published` / `website_indexed` ante edits manuales — `-u` no propaga el cambio, hace falta `psql ... UPDATE website_page SET cache_time = 0 WHERE url = '...'` post-deploy. La auto-invalidate vía `data-no-page-cache=""` en el arch (verificable en `website.page._can_be_cached`) sólo se dispara durante writes específicos al `vals['arch']` desde -u — descartada por menos verificable que el campo explícito. **Cuándo aplica**: cualquier `website.page` cuyo render dependa de `request.session`, cookies, headers o cualquier estado fuera del cache_key. Verificado empíricamente cerrando `deferred-q4-gracias-direct-access` (decisions-log §6).

**Scroll-driven cinemática sobre N hitos discretos con animación de duración D produce ghost cuando cadencia inter-step puede ser < D.** Wheel rápido típico genera idx changes a 30-200 ms vs duración mínima de animación cinemática 0.5 s — las CSS transitions (o GSAP tweens) en cada step se redirigen al nuevo target antes de completar: el item asoma hacia un slot y se desvía a otro a medio camino sin completar la transición (efecto ghost). Snap discreto a N stops (e.g. `ScrollTrigger.snap: {snapTo: 1/(N-1)}`) sólo agrava el problema porque produce los idx changes que el wheel rápido interrumpe. **Fix por construcción**: scrub continuo SIN snap. Items animados continuamente con `progress 0..1` vía `ScrollTrigger.onUpdate`, propiedades inline (`left`, `scale`, `opacity`, `width`, `color`) calculadas frame-by-frame desde el progress. SIN clases `is-step-N` discretas. SIN transitions CSS sobre las propiedades animadas — el JS provee el flujo a 60fps via Lenis raf → `ScrollTrigger.update`. Cada frame es la verdad; no hay tween en flight que pueda ser interrumpido. **Trade-off documentado**: pierde "sensación de hitos discretos snappeados" (los items pasan continuamente a través de slots virtuales en lugar de saltar de uno a otro); a cambio respeta la física del scroll del usuario sin patches. **Cuándo aplica**: cualquier carrusel scroll-jacked sobre N elementos discretos con cadencia inter-step posible debajo de la duración de la animación visual. Verificado empíricamente cerrando `deferred-timeline-scrolljacking` (decisions-log §6) — los 5 sprints de D28 (CSS transitions, calibración pinScroll, GSAP `overwrite:'auto'`, throttling) no resolvieron el ghost porque atacaban el síntoma en lugar de la causa estructural; Pieza E v3 lo descartó por diseño.

### Git

- **Repo activo (fase experimental)**: `github.com/AnerAvanzosc/website_avanzosc_demo` (público, fork personal). El repo oficial `github.com/avanzosc/odoo-addons` **NO se toca** durante esta fase.
- Commits pequeños, mensajes en inglés (convención OCA): `[ADD] website_avanzosc_demo: snippet hero with GSAP entrance animation`.
- Una rama por feature: `feature/home-hero`, `feature/timeline-trayectoria`, etc.
- **NO** commitear archivos generados: `.pyc`, `__pycache__/`, logs, `.vscode/`, `.idea/`. Verificar que el `.gitignore` del repo los cubre.

Prefijos de commit (mapeo de uso para este proyecto):

| Prefijo | Uso |
|---|---|
| `[ADD]` | Añadir un módulo nuevo completo o un componente arquitectural mayor. |
| `[FEAT]` | Implementar una tarea concreta del plan dentro de un módulo existente (uso principal durante v1). |
| `[FIX]` | Corregir un bug detectado. |
| `[IMP]` | Mejorar algo existente sin que sea bug ni feature nueva. |
| `[REF]` | Refactor sin cambio de comportamiento. |
| `[REM]` | Eliminar código. |
| `[MIG]` | Migración entre versiones de Odoo. |
| `[DOC]` | Solo documentación. |

---

## 6. Lo que NO hacer

- **NO** tocar el Website Builder visual. Todo por código.
- **NO** modificar archivos dentro de `/opt/odoo/v14/odoo/addons/` (core). Solo heredar.
- **NO** añadir `package.json` ni dependencias npm al módulo. Librerías por CDN.
- **NO** usar sintaxis de Odoo 15+ (ES6 modules, manifest assets). Estamos en v14.
- **NO** guardar credenciales ni API keys en el código. `ir.config_parameter` o variables de entorno.
- **NO** commitear datos reales de clientes en casos de éxito de prueba. Datos ficticios hasta aprobación del cliente.
- **NO** replicar la estructura densa de párrafos de la web actual. La nueva va a tener ~30% del texto actual y triple de impacto.
- **NO** usar stock photos genéricos (ver `docs/brand-guide.md` §6 para criterios fotografía).

---

## 7. Decisiones

Detalle íntegro de cada decisión (validaciones literales, justificaciones técnicas, ejemplos de código): `docs/decisions-log.md`. Esta sección mantiene solo el índice ultra-comprimido.

### Pre-spec

| ID | Resumen | Detalle |
|---|---|---|
| Módulos website-* | website/sale/slides instalados; blog desinstalado post-v1 | [link](docs/decisions-log.md#pre-modules) |
| Arquitectura | Todo dentro del mismo Odoo, tema custom sobre `website` | [link](docs/decisions-log.md#pre-arch) |
| Nombre del módulo | `website_avanzosc_demo` | [link](docs/decisions-log.md#pre-name) |
| Repo y ruta | Fork `AnerAvanzosc/website_avanzosc_demo` + `/opt/odoo/v14/workspace/...` | [link](docs/decisions-log.md#pre-repo) |
| Idiomas | ES + EU, raíz ES + `/eu/` | [link](docs/decisions-log.md#pre-langs) |
| Claim home | «Odoo industrial de verdad, desde 2008.» / EU «Benetako Odoo industriala, 2008tik.» | [link](docs/decisions-log.md#pre-claim) |
| Estructura home | 8 secciones funnel B2B, 9 snippets QWeb | [link](docs/decisions-log.md#pre-home) |
| Casos de éxito | 8 archetypes anónimos cubriendo los 4 sectores | [link](docs/decisions-log.md#pre-cases) |
| Blog | Fuera del sitio | [link](docs/decisions-log.md#pre-blog) |
| Datos legales footer | CIF B20875340 · Azkoitia · 943 026 902 · comercial@avanzosc.es | [link](docs/decisions-log.md#pre-legal) |

### D1–D27

| ID | Resumen | Detalle |
|---|---|---|
| D1 | Sectoriales con patrón común + bloque específico por sector | [link](docs/decisions-log.md#d1) |
| D2 | Slugs EU traducidos al euskera bajo `/eu/` | [link](docs/decisions-log.md#d2) |
| D3 | Caso de éxito en home seleccionable vía `ir.config_parameter` | [link](docs/decisions-log.md#d3) |
| D4 | Snippets v1 fuera del Website Builder (solo `t-call` desde páginas) | [link](docs/decisions-log.md#d4) |
| D5 | `/kit-consulting` ES-only | [link](docs/decisions-log.md#d5) |
| D6 | Convivencia en `nueva.avanzosc.es` durante QA + switchover 301 | [link](docs/decisions-log.md#d6) |
| D7 | Setup de menús vía `post_init_hook` (XML no cubre multi-website) | [link](docs/decisions-log.md#d7) |
| D8 | Cleanup menús default Odoo vía `Menu.unlink()` cascade-by-URL | [link](docs/decisions-log.md#d8) |
| D9 | i18n: ES source en QWeb + `i18n/eu.po`, sin `.pot` en v1 | [link](docs/decisions-log.md#d9) |
| D10 | Activación de idiomas vía hook imperativo (no XML data) | [link](docs/decisions-log.md#d10) |
| D11 | Lenis 1.0.42 sin `anchors`: listener manual delegado en `document` | [link](docs/decisions-log.md#d11) |
| D12 | Compensación bias residual ~+16px Lenis scrollTo vía `+20` breathing | [link](docs/decisions-log.md#d12) |
| D13 | Header height dinámico (`offsetHeight + 20`), no offset fijo | [link](docs/decisions-log.md#d13) |
| D14 | Detección home dual: `path == '/'` o `path == url_for('/')` | [link](docs/decisions-log.md#d14) |
| D15 | `publicWidget` selector `'body'` no auto-instancia: enganchar a `AvanzoscRoot.start()` | [link](docs/decisions-log.md#d15) |
| D16 | Honeypot: `position:absolute` + `clip-path` (no `display:none`) | [link](docs/decisions-log.md#d16) |
| D17 | Páginas via redirect: `is_published=True` + `website_indexed=False` | [link](docs/decisions-log.md#d17) |
| D18 | Form lang-aware: redirect via `request.lang.url_code` en controller | [link](docs/decisions-log.md#d18) |
| D19 | Page transition Propuesta A descartada por FOFC en lazy bundle | [link](docs/decisions-log.md#d19) |
| D20 | Page transition fade 200→100 ms (Propuesta D); B diferida | [link](docs/decisions-log.md#d20) |
| D21 | Q5/Q6 cerrados — redirects 301 legacy `/blog/*` y `/page/kit-digital` | [link](docs/decisions-log.md#d21) |
| D22 | Q2 cerrada — alias público `/clientes` → 301 a `/web/login` | [link](docs/decisions-log.md#d22) |
| D23 | Eliminada página `/trabaja-con-nosotros`: 6 items menú + redirect 301 a `/conocenos` | [link](docs/decisions-log.md#d23) |
| D24 | Q3 fase 1 — paquete pre-revisión legal + 5 fixes obvios aplicados | [link](docs/decisions-log.md#d24) |
| D25 | Q4 cerrada — Plausible Cloud (hosted EU, sin cookies, RGPD-friendly) | [link](docs/decisions-log.md#d25) |
| D26 | B4 hreflang home EU canonical defense-in-depth (sitemap + `_dispatch` override) | [link](docs/decisions-log.md#d26) |
| D27 | Pieza A hero technical blueprint decoration (grid + líneas + parallax) | [link](docs/decisions-log.md#d27) |

### Decisiones pendientes

- [ ] **Q1 — DRAFTs EU**: 180 strings `i18n/eu.po` pendientes revisión equipo. Sub-gate Q3: 23 LEGAL DRAFT entradas requieren asesoría legal. Bloqueante switchover. Runbook: [docs/q1-validation-runbook.md](docs/q1-validation-runbook.md).
- [ ] **v2 deuda — refactor sticky header `padding` transition**: `_header.scss:51`, única animación layout-property. Diferido a v2 per Phase 9.7.
- [ ] **Hex exactos del logo** — extraer y actualizar `docs/brand-guide.md` §3.
- [ ] **SVG del logo** — vectorizar antes de picar tema.
- [ ] **Portal ERP «Acceso clientes»** — ¿`/web/login` estándar o URL custom?
- [ ] **Plan migración contenido antiguo** — tienda/cursos: ¿migrar o solo re-skinear?
- [ ] **Diferido — `publicWidget` selector `'body'` no instancia** — workaround D15 vigente. [link](docs/decisions-log.md#deferred-publicwidget-body).
- [ ] **Diferido — TTFB prod re-validate** — D20 medido en localhost. Trigger: post-switchover Phase 10.6. [link](docs/decisions-log.md#deferred-ttfb-prod).
- [ ] **Diferido — claim STEM en body `/conocenos` (B2)** — pre-switchover OBLIGATORIO. Sin trigger atendido NO autorizar switchover. [link](docs/decisions-log.md#deferred-conocenos-stem-claim).
- [ ] **Diferido — Lighthouse Best Practices 81-82/100** — origen upstream Odoo 14, sin parche posible. [link](docs/decisions-log.md#deferred-lighthouse-best-practices-upstream).
- [ ] **Diferido — contraste `--brand-primary` 15 nodos (C3 brand)** — acoplado con hex finales del logo. Recomendado pre-switchover (EAA 2025). [link](docs/decisions-log.md#deferred-brand-primary-contrast).

---

## 8. Convenciones operativas

No-negociables operativos (complementan los técnicos de §6). Aplican a Claude principal, a cualquier subagente dispatched, y a futuros añadidos al proyecto.

1. **NO añadir trailer `Co-Authored-By:` a ningún commit.** Los commits son atribuidos al usuario que opera la herramienta. Excepción única: que el usuario lo pida explícitamente en una sesión concreta. La autorización NO se hereda entre sesiones.

2. **NO crear archivos fuera del scope literal de la tarea**, aunque «vengan bien» para tareas futuras. Si una tarea X.Y crea `foo.scss`, eso es lo único que crea, aunque el implementer prevea que `bar.scss` se necesitará en X.Z. Las dependencias se respetan en el orden del plan.

   **Aclaración**: si una tarea genera artefactos en una carpeta con `README` / index documentado (snapshots, smoke logs, etc.), **actualizar ese README es scope de la tarea, no scope creep**. Distinguir entre «no crear archivos no pedidos» (regla activa) y «mantener consistente la documentación de los archivos que sí pides» (parte del scope). Ejemplo: Task 0.2 crea 4 PNGs en `docs/superpowers/plans/snapshots/00-baseline/` → su README debe listarlas; Task 0.3 añade un PNG más a esa carpeta → su scope incluye actualizar el README con la nueva entrada.

3. **Verificar antes de crear**: si la tarea crea archivos en una carpeta, primero `ls` (o equivalente) para ver si ya existen. Si existen, **leer y extender**, no sobrescribir.

4. **Cada tarea tiene smoke test obligatorio post-implementación**: el módulo debe recargar sin errores ni warnings nuevos (comando en §5). Sin smoke test verde, la tarea no se cierra.

5. **El smoke test se ejecuta y se guarda en `docs/smoke-tests/<task-id>.log`** (ej: `docs/smoke-tests/0.1.log`). El log captura las **últimas 20 líneas del output** de Odoo tras `-u <module> --stop-after-init`. El commit que cierra la tarea incluye este archivo. Sin log, tarea no cierra.

   **Política de warnings toleradas**: el log se guarda íntegro. Cualquier warning **no listado** abajo debe investigarse antes de cerrar la tarea. Tolerado actualmente:
   - `DeprecationWarning: nodes.Node.traverse()` en `ir_module.py:128` — ruido del core Odoo 14, no afecta funcionalidad.

   Si aparece una warning recurrente nueva del core, se añade a esta lista en un commit `[DOC]` aparte.

6. **El smoke test se ejecuta SIEMPRE vía `./scripts/run-smoke.sh <task-id>`**, nunca invocando `odoo-bin` directamente. El script gestiona el ciclo «parar dev server → smoke → restart dev server con los mismos args», escribe `docs/smoke-tests/<task-id>.log` (regla #5) y devuelve exit code 1 si el output contiene `Traceback` o `ERROR`. Esta regla aplica a Claude principal y a cualquier subagente. El comando subyacente que ejecuta el script está documentado en §5 y solo es referencia interna; en flujo real se invoca por el script. **Garantía del script**: `exit 0` implica que el dev server responde HTTP 200/303 en `localhost:14070` tras el restart, no solo que el proceso esté vivo. Tres modos de fallo del restart se detectan con diagnóstico distinguido en stderr: «died immediately after restart», «died before listening on :14070», «alive but not listening on :14070».

7. **Reglas STOP de seguridad**: cuando una regla de las anteriores (o cualquier rule explícita en este documento) se dispara como «STOP», parar inmediatamente. Pero **la regla cubre un riesgo, no una condición sintáctica**. Si la investigación honesta demuestra que el riesgo NO aplica al caso concreto (p. ej., un xml_id en módulo distinto de `__export__/base` pero con `noupdate=true` que neutraliza la recreación tras delete), presentar la evidencia al usuario y pedir decisión humana — **no proceder en silencio ni saltarse la regla por interpretación propia**. La separación entre «condición que dispara el STOP» y «riesgo que la regla cubre» es responsabilidad del agente surfacearla; la decisión de continuar o respetar el STOP estricto es del usuario.

8. **Validar estado real del repo al arrancar sesión**: al iniciar una sesión nueva, especialmente tras compaction, ejecutar `git log -20 --oneline` y `git status` ANTES de fiarse del summary o de empezar trabajo. **El summary post-compaction es referencia útil pero no fuente de verdad — el repo lo es.** El summary describe el estado en el momento de la compactación, que puede estar horas o días detrás del HEAD real (p.ej. una sesión paralela committeó la fase siguiente mientras la compactación estaba en flight). Cross-check obligatorio: comparar el último commit con lo que el summary describe como «en flight». Si el commit ya existe en HEAD pero el summary dice «trabajando en X», el summary está stale — STOP, no escribir, preguntar al usuario qué hacer. Aplicar también a tasks/todos del system reminder: reflejan la lista de la conversación, no necesariamente el repo. Aprendizaje de incidente sesión 2026-04-29 (Phase 6 duplicada, ~30 min perdidos + records orfanos en BD).

**Política de añadidos a este documento**: cualquier sección nueva (§9, §10, …) va al final, NUNCA insertada en medio. Numeración estable = referencias estables.
