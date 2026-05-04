Nunca operar sobre GitHub (push, branches, PRs, settings, releases) sin autorización explícita en la sesión actual. Las autorizaciones son puntuales y NO se heredan entre sesiones.
# Proyecto: Web corporativa `website_avanzosc_demo`

Rediseño completo de **avanzosc.es**. Avanzosc S.L. es una consultora de Odoo fundada en 2008, con sede en Azkoitia (Gipuzkoa). El objetivo es sustituir la web actual (tema Odoo genérico) por una web moderna, con personalidad de marca, que capitalice los diferenciadores reales de la empresa y funcione como canal de captación B2B.

Stack: **módulo custom sobre Odoo 14 Community**, instalación nativa.

---

## 1. Arquitectura global

Enfoque **todo dentro de Odoo**, tema custom sobre `website`:

- **Web corporativa** (inicio, soluciones sectoriales, conócenos, contacto) → módulo `website_avanzosc_demo`.
- **Tienda** → `website_sale` existente, re-skineada con el tema.
- **Formación** → `website_slides` existente, re-skineada.
- **Portal ERP de clientes** → `portal` estándar, acceso desde botón "Acceso clientes" en header.

Mismo dominio, mismo servidor, mismo Odoo.

---

## 2. Estructura de navegación (nueva)

Menú principal:

Orden por prioridad de funnel B2B (decisión 2026-04-28): los 5 primeros
hasta Contacto son los high-conversion items del funnel; el último
(Conócenos) es secundario. Post-v1 sesión 2026-04-30: el item «Empleo»
(página /trabaja-con-nosotros) se eliminó del menú y la URL redirige 301
a /conocenos vía `data/redirects.xml`.

1. **Inicio**
2. **Soluciones** (dropdown — renombrado desde «Soluciones sectoriales»;
   el adjetivo era redundante con el contenido del dropdown y consumía
   ancho del navbar):
   - Industrial (fabricación, química, alimentaria, mecanizado, textil)
   - Distribución (retail, ecommerce, mayoristas)
   - Servicios (IT, SAT, despachos)
   - Academias y centros educativos
3. **Tienda**
4. **Formación** (renombrado de "Cursos")
5. **Contacto**
6. **Conócenos**

**Fuera del menú principal**:
- **Kit Consulting Red.es** → landing en `/kit-consulting`, banner temporal en home.
- **FAQ** → no como página separada; preguntas integradas en cada página de servicio.
- **Acceso clientes** → botón destacado arriba-derecha del header.

---

## 3. Stack técnico (Odoo 14)

**Frontend:**
- Bootstrap 5 (el que trae v14, no actualizar).
- SCSS compilado por el sistema de assets de Odoo.
- QWeb para templates (sintaxis v14, **no v15+**).
- JavaScript con `odoo.define(...)` (sistema legacy de v14). **NO usar ES6 modules** (`@odoo/x`).

**Librerías externas (CDN, no npm):**
- **GSAP 3** (+ ScrollTrigger, SplitText) → animaciones orquestadas.
- **Lenis** → smooth scroll.
- **IntersectionObserver nativo** → reveal-on-scroll. No usar AOS ni WOW.js.
- **Swiper** → sliders (verificar si ya está cargado por otro módulo antes de duplicar).

**Backend (cuando haga falta):**
- Python **3.10.12** en modelos custom (venv en `/opt/odoo/v14/venv/bin/python`).
- Aunque 3.10 permite sintaxis moderna (walrus operator, pattern matching, union types con `|`), **evitarla en módulos Odoo 14** para mantener consistencia con el core (escrito pensando en 3.6+). Usar estilo clásico Odoo.
- Heredar modelos existentes con `_inherit`, nunca reescribir.

---

## 4. Reglas de código NO NEGOCIABLES

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

## 5. Animaciones y UX

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

## 6. Flujo de trabajo con Claude Code

### MCPs disponibles
- `context7` → docs actualizadas. Antes de usar GSAP, Lenis, Bootstrap 5, Odoo 14 API, etc., invocar con "use context7".
- `playwright` → verificación visual. URL local: `http://localhost:14070`.
- `filesystem` → acceso a `/opt/odoo/v14/`.
- `odoo` → consultas a la instancia `odoo14_community` (solo lectura).

### Antes de cualquier cambio visual
1. Consultar el modelo real con MCP `odoo` si afecta a modelo existente.
2. Abrir la página con Playwright, screenshot "antes".
3. Picar el código.
4. Recargar y screenshot "después".
5. Verificar que no se ha roto nada adyacente (header, footer, otros snippets).

### Flujo para features nuevas
1. `/superpowers:brainstorm` → refinar antes de picar.
2. `/superpowers:write-plan` → plan por fases.
3. `/superpowers:execute-plan` → implementación con TDD y revisión.

### Flujo para cambios pequeños
Directo, pero con Playwright abierto para verificar.

---

## 7. Servidor Odoo local

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

## 8. Estructura de carpetas

```
website_avanzosc_demo/
├── __init__.py
├── __manifest__.py
├── data/
│   └── snippets.xml
├── views/
│   ├── assets.xml
│   ├── layout.xml
│   ├── pages/
│   │   ├── home.xml
│   │   ├── industrial.xml
│   │   ├── distribucion.xml
│   │   ├── servicios.xml
│   │   ├── academias.xml
│   │   ├── conocenos.xml
│   │   ├── contacto.xml
│   │   └── kit_consulting.xml
│   └── snippets/
│       ├── hero.xml
│       ├── pilares.xml
│       ├── contador_modulos.xml
│       ├── timeline_trayectoria.xml
│       ├── sectores_grid.xml
│       ├── sector_specifics.xml
│       ├── equipo.xml
│       ├── caso_exito.xml
│       ├── cta_kit_consulting.xml
│       └── cta_contacto.xml
├── static/
│   ├── src/
│   │   ├── scss/
│   │   │   ├── _variables.scss
│   │   │   ├── _mixins.scss
│   │   │   ├── _typography.scss
│   │   │   ├── main.scss
│   │   │   └── snippets/
│   │   ├── js/
│   │   │   ├── main.js
│   │   │   └── snippets/
│   │   └── img/
│   └── description/
│       └── icon.png
└── models/
```

---

## 9. Identidad de marca y visual

### 9.1 Posicionamiento

**Claim candidato**: *"17 años convirtiendo Odoo en la ventaja competitiva de la industria."*
(Variantes a testar: *"Odoo industrial de verdad, desde 2008."* / *"Los veteranos de Odoo en España."*)

**Tres pilares diferenciadores** que deben aparecer en la home sí o sí:

1. **Trayectoria**: *Desde 2008. Desde OpenERP. Antes incluso de que se llamara Odoo.* → timeline visual con hitos: 2008 TinyERP, 2010 co-organizadores Jornadas OpenERP Bilbao, 2012 Jornadas Donosti, 2014 nace Odoo + OdooMRP, 2019 grupo 7 colegios, 2022 Kit Digital, 2024 Kit Consulting, hoy 600+ módulos.

2. **Volumen técnico real**: *600+ módulos desarrollados, contribuidores activos de OCA.* → contador animado + grid de apps/módulos destacados.

3. **Equipo único**: *Un equipo STEM mayoritariamente femenino liderando Odoo industrial.* → sección de equipo con fotos reales, titulación y especialidad técnica (matemáticas, telecos, informática, gestión). Esto es un activo de marca real que la competencia no puede copiar.

### 9.2 Tono de voz

**Cercano, técnico, honesto, con orgullo local.**

- Tuteo por defecto (*"te ayudamos"*, *"tu empresa"*).
- Términos técnicos usados con precisión, sin disimular: *"migración OpenUpgrade"*, *"módulos OCA"*, *"localización fiscal española"*. El target sabe lo que es o debería.
- Frases cortas. Mucho punto. Pocos gerundios.
- Cero palabrería tipo *"soluciones 360º"*, *"sinergias"*, *"transformamos tu negocio"*. Banned.
- Guiños sutiles al arraigo vasco cuando encaje, sin forzar. Los nombres del equipo ya hacen parte del trabajo.
- Humor seco permitido en microcopies (*"FAQ: porque siempre hay alguien que pregunta primero"*).

### 9.3 Paleta de color

> ⚠️ **Pendiente**: extraer los hex exactos del logo actual (`https://avanzosc.es/web/image/website/1/logo/Avanzosc`). Descargarlo, abrirlo en cualquier selector de color (Figma, macOS Color Meter, o `convert logo.png -resize 1x1 txt:` con ImageMagick), y **actualizar esta tabla** antes de comenzar el tema.

**Propuesta inicial** (refinar tras extraer del logo):

| Rol | Hex propuesto | Uso |
|-----|--------------|-----|
| `--brand-primary` | `#E85D2F` | CTAs principales, acentos, links hover |
| `--brand-primary-dark` | `#C44015` | Hover de primary, cabeceras fuertes |
| `--brand-secondary` | `#1B2A41` | Headlines, header, footer |
| `--brand-accent` | `#F5B800` | Highlights puntuales, badge "Kit Digital" |
| `--neutral-900` | `#0F1419` | Texto principal |
| `--neutral-700` | `#3A4149` | Texto secundario |
| `--neutral-500` | `#7A828B` | Metadatos, fechas, labels |
| `--neutral-300` | `#D3D7DC` | Bordes, separadores |
| `--neutral-100` | `#F4F5F7` | Fondos de sección alternos |
| `--neutral-0` | `#FFFFFF` | Fondo base |
| `--success` | `#2D8B57` | Confirmaciones |
| `--danger` | `#C73E3E` | Errores |

**Modo oscuro**: opcional en v2. Priorizar modo claro bien hecho primero.

### 9.4 Tipografía

**Display (headings)**: `Space Grotesk` (Google Fonts, gratis). Moderno + técnico sin ser frívolo.

**Body**: `Inter` (Google Fonts, gratis, variable font).

**Mono (código, datos, labels técnicos)**: `JetBrains Mono` (gratis).

**Jerarquía**:
- H1: 56-72px Space Grotesk, -0.02em letter-spacing, peso 600.
- H2: 40-48px Space Grotesk, peso 500.
- H3: 28-32px Space Grotesk, peso 500.
- Body: 18px Inter, line-height 1.65.
- Small: 14px Inter, peso 500, tracking +0.02em.

**Prohibido**: combinar dos display. Times/Georgia con Space Grotesk. Fuentes de sistema (Arial, Helvetica) como principal.

### 9.5 Logo

**Actual**: `https://avanzosc.es/web/image/website/1/logo/Avanzosc` (PNG).

**A preparar antes del desarrollo**:
- SVG vectorial limpio (el actual es bitmap; no vale para web moderna).
- Versión horizontal + versión compacta/isotipo.
- Versión sobre fondo claro + sobre fondo oscuro.
- Favicon 32x32 y 16x16, PNG transparente + ICO.
- Apple touch icon 180x180.

Si no hay SVG, **vectorizar antes de picar código**. No merece la pena arrancar con un logo pixelado.

### 9.6 Estilo fotográfico

**Prioridad 1 — Fotografía real del equipo.** Las fotos actuales están desactualizadas y con calidades inconsistentes. Sesión profesional pendiente: estilo reportaje, luz natural, sin fondos blancos de estudio. Se les ve trabajando, conversando, pensando. Nada de brazos cruzados corporate.

**Prioridad 2 — Sector industrial real.** En vez de stock photos de "ingeniero con tablet", fotos de clientes reales (con permiso) en su fábrica, almacén, taller. Planificar que las fotos nuevas salgan de visitas comerciales futuras.

**Prioridad 3 — Evitar stock photos obvios.** Si hay que usar stock: Unsplash/Pexels con criterio. NUNCA Shutterstock estándar. Preferir capturas reales de Odoo (dashboards, reports) personalizadas para clientes (anonimizadas) antes que stock malo.

**No usar**:
- Stock photos de "oficina moderna diáfana".
- Handshakes.
- Gráficas 3D genéricas flotando.
- Mockups de iPhone/MacBook con captura borrosa.

### 9.7 Iconografía

**Lucide Icons** (SVG, gratis, consistente, moderno) para todo el sistema. No mezclar con FontAwesome ni emojis en la UI.

### 9.8 Principios de composición

- **Asimetría controlada**. Romper el grid en momentos puntuales (hero, transiciones) pero mantener rejilla base en contenido denso.
- **Espacio negativo generoso**. La web actual sufre de claustrofobia — este rediseño corrige eso.
- **Densidad variable**. Alternar secciones respiradas con secciones densas de datos (ej: timeline 2008-2024 más densa; hero y CTAs muy respirados).
- **Jerarquía por tamaño antes que por color**. Los headlines mandan por tamaño + tipografía, no por pintarlos de naranja.
- **Números grandes**. El "600+" y "17 años" son activos — tratarlos como tal (80-120px, display tipo editorial).

---

## 10. Lo que NO hacer (recordatorios finales)

- **NO** tocar el Website Builder visual. Todo por código.
- **NO** modificar archivos dentro de `/opt/odoo/v14/odoo/addons/` (core). Solo heredar.
- **NO** añadir `package.json` ni dependencias npm al módulo. Librerías por CDN.
- **NO** usar sintaxis de Odoo 15+ (ES6 modules, manifest assets). Estamos en v14.
- **NO** guardar credenciales ni API keys en el código. `ir.config_parameter` o variables de entorno.
- **NO** commitear datos reales de clientes en casos de éxito de prueba. Datos ficticios hasta aprobación del cliente.
- **NO** replicar la estructura densa de párrafos de la web actual. La nueva va a tener ~30% del texto actual y triple de impacto.

---

## 11. Decisiones

Detalle íntegro de cada decisión (validaciones literales, justificaciones técnicas, ejemplos de código): [docs/decisions-log.md](docs/decisions-log.md). Esta sección mantiene solo el índice.

### Decisiones cerradas — pre-spec (brainstorm 2026-04-27)

| Decisión | Resumen | Detalle |
|---|---|---|
| Módulos website-* | `website`, `website_sale`, `website_slides` instalados; `website_blog` **desinstalado** post-v1 (sesión 2026-04-30, hijack converters bloqueaba Q5 redirects); fuera de `depends`. | [decisions-log#pre-modules](docs/decisions-log.md#pre-modules) |
| Arquitectura | Todo dentro del mismo Odoo, tema custom sobre `website`. | [decisions-log#pre-arch](docs/decisions-log.md#pre-arch) |
| Nombre del módulo | `website_avanzosc_demo`. | [decisions-log#pre-name](docs/decisions-log.md#pre-name) |
| Repo y ruta | `github.com/AnerAvanzosc/website_avanzosc_demo`, `/opt/odoo/v14/workspace/website_avanzosc_demo`. | [decisions-log#pre-repo](docs/decisions-log.md#pre-repo) |
| Idiomas | ES + EU, raíz ES + `/eu/`. | [decisions-log#pre-langs](docs/decisions-log.md#pre-langs) |
| Claim home | «Odoo industrial de verdad, desde 2008.» / EU «Benetako Odoo industriala, 2008tik.». | [decisions-log#pre-claim](docs/decisions-log.md#pre-claim) |
| Estructura home | 8 secciones funnel B2B con 9 snippets QWeb. | [decisions-log#pre-home](docs/decisions-log.md#pre-home) |
| Casos de éxito | Catálogo de 8 archetypes anónimos cubriendo los 4 sectores. | [decisions-log#pre-cases](docs/decisions-log.md#pre-cases) |
| Blog | Fuera del sitio. | [decisions-log#pre-blog](docs/decisions-log.md#pre-blog) |
| Datos legales footer | CIF B20875340 · Av. Julio Urkijo 34 bajo, Azkoitia · 943 026 902 · comercial@avanzosc.es. | [decisions-log#pre-legal](docs/decisions-log.md#pre-legal) |

### Decisiones cerradas — D1–D10

| ID | Decisión | Detalle |
|----|----------|---------|
| D1 | Sectoriales con patrón común + bloque específico por sector. | [decisions-log#d1](docs/decisions-log.md#d1) |
| D2 | Slugs EU traducidos al euskera bajo `/eu/`. | [decisions-log#d2](docs/decisions-log.md#d2) |
| D3 | Caso de éxito en home seleccionable vía `ir.config_parameter`. | [decisions-log#d3](docs/decisions-log.md#d3) |
| D4 | Snippets v1 fuera del Website Builder (solo `t-call` desde páginas). | [decisions-log#d4](docs/decisions-log.md#d4) |
| D5 | `/kit-consulting` ES-only. | [decisions-log#d5](docs/decisions-log.md#d5) |
| D6 | Convivencia en `nueva.avanzosc.es` durante QA + switchover con 301. | [decisions-log#d6](docs/decisions-log.md#d6) |
| D7 | Setup de menús vía `post_init_hook` (XML no cubre sub-jerarquías multi-website). | [decisions-log#d7](docs/decisions-log.md#d7) |
| D8 | Cleanup de menús default Odoo vía `Menu.unlink()` cascade-by-URL. | [decisions-log#d8](docs/decisions-log.md#d8) |
| D9 | i18n: ES source en QWeb + `i18n/eu.po`, sin `.pot` en v1. | [decisions-log#d9](docs/decisions-log.md#d9) |
| D10 | Activación de idiomas vía hook imperativo (no `data/website_config.xml`). | [decisions-log#d10](docs/decisions-log.md#d10) |

### Decisiones cerradas — post-v1 polish (D11–D20)

Sub-bloques A (transiciones suaves) + B (rediseño /contacto) + iteración A6 (latencia page transition). Sesiones 2026-04-29 / 2026-04-30. Detalle íntegro en [decisions-log §5](docs/decisions-log.md#5-post-v1-polish-d11d20).

| ID | Decisión | Detalle |
|----|----------|---------|
| D11 | Lenis 1.0.42 sin built-in `anchors`: listener manual delegado en `document` | [decisions-log#d11](docs/decisions-log.md#d11) |
| D12 | Compensación bias residual ~+16 px de Lenis scrollTo vía `+20` breathing | [decisions-log#d12](docs/decisions-log.md#d12) |
| D13 | Header height dinámico (`header.offsetHeight + 20`) — no offset fijo | [decisions-log#d13](docs/decisions-log.md#d13) |
| D14 | Detección home dual: `path == '/' or path == url_for('/')` | [decisions-log#d14](docs/decisions-log.md#d14) |
| D15 | `publicWidget` selector `'body'` no auto-instancia: enganchar a `AvanzoscRoot.start()` | [decisions-log#d15](docs/decisions-log.md#d15) |
| D16 | Honeypot: `position:absolute` + `clip-path` (no `display:none`) | [decisions-log#d16](docs/decisions-log.md#d16) |
| D17 | Páginas via redirect: `is_published=True` + `website_indexed=False` | [decisions-log#d17](docs/decisions-log.md#d17) |
| D18 | Form lang-aware: redirect via `request.lang.url_code` en controller | [decisions-log#d18](docs/decisions-log.md#d18) |
| D19 | Page transition Propuesta A descartada por FOFC en stack lazy bundle | [decisions-log#d19](docs/decisions-log.md#d19) |
| D20 | Page transition fade recortado 200→100 ms (Propuesta D); B diferida | [decisions-log#d20](docs/decisions-log.md#d20) |
| D21 | Q5/Q6 cerrados: redirects 301 legacy `/blog/*` → home + `/page/kit-digital` → `/#kit-consulting` | [decisions-log#d21](docs/decisions-log.md#d21) |
| D22 | Q2 cerrada: alias público `/clientes` → 301 a `/web/login` (URL canónica Odoo como detalle interno) | [decisions-log#d22](docs/decisions-log.md#d22) |
| D23 | Eliminada página `/trabaja-con-nosotros`: menú ahora 6 items + redirect 301 a `/conocenos`, 21 strings retiradas de `eu.po`. Commit `4ecd0e1`. | [decisions-log#d23](docs/decisions-log.md#d23) |
| D24 | Q3 fase 1: paquete pre-revisión legal (PDFs + XLSX 23 strings + datos sensibles MD) + 5 fixes obvios aplicados (LOPDGDD body, cookies tabla, link `/politica-cookies`, mailto aviso, AEPD canónica). Commits `0e152e7` + `12a742a`. | [decisions-log#d24](docs/decisions-log.md#d24) |
| D25 | Q4 cerrada: Plausible Analytics Cloud (hosted EU, sin cookies, RGPD-friendly) — script combinado `script.404.outbound-links.js` en `<head>` via `web.layout` + goal `Contact Form Submission` inline en `/contacto/gracias` (DOMContentLoaded, guarded por adblock). Mención requerida en aviso/privacidad — pending para Q3 fase 2. | [decisions-log#d25](docs/decisions-log.md#d25) |
| D26 | Sprint B4 (audit I4): hreflang home EU canonical, defense-in-depth — Capa 1 sitemap emite `/eu_ES` sin trailing alineado con special case Odoo `_get_canonical_url_localized`; Capa 2 override `ir.http._dispatch` (en `models/ir_http.py`) intercepta `/eu_ES/` y emite 301 a `/eu_ES` antes de Werkzeug routing. Iteración: `website.rewrite` ineficaz (route precedence) y `@http.route('/eu_ES/')` causaba loop self-redirect (`strict_slashes=False`). | [decisions-log#d26](docs/decisions-log.md#d26) |

### Decisiones pendientes

- [ ] **Q1 — Validación lingüística DRAFTs**: 180 strings DRAFT en `i18n/eu.po` (post eliminación /trabaja-con-nosotros — D23) pendientes de revisión por equipo Avanzosc per runbook `docs/q1-validation-runbook.md`. Gate Phase 9.5 abierto, bloqueante switchover Phase 10. Sub-gate Q3 (23 LEGAL DRAFT entradas en legales) requiere también revisión por asesoría legal.
- [ ] **v2 deuda: refactor sticky header `padding` transition** — la única animación layout-property del módulo (`_header.scss:51`). Phase 8.3 audit + Phase 9 QA visual confirmaron que el comportamiento actual es funcional sin artefactos visibles, ~22 layout events/sec scroll active. Diferido a v2 per decisión condicional D3 (sesión 2026-04-29 Phase 9.7) — refactor a `transform: scaleY` con child wrapper requiere repensar la estructura interna del navbar (sticky + navbar-collapse mobile + box-shadow + 3 transitions co-localizadas). Pre-existente justificación Phase 1.3 mantenida.
- [ ] **Hex exactos del logo** — extraer de `https://avanzosc.es/web/image/website/1/logo/Avanzosc` y actualizar tabla §9.3.
- [ ] **SVG del logo** — vectorizar si no existe ya.
- [ ] **Portal ERP actual** — ¿«Acceso clientes» apunta a `/web/login` estándar o URL custom?
- ~~**Analytics y tracking** — GA4, Plausible o Matomo. Decidir antes de producción.~~ **Cerrado D25 (sesión 2026-05-04): Plausible Cloud hosted EU.**
- [ ] **Plan de migración de contenido antiguo** — tienda y cursos: ¿migrar productos/cursos o solo re-skinear?
- [ ] **Diferido — investigar `publicWidget` selector `'body'` no instancia** — workaround D15 vigente. Trigger reapertura: si una próxima feature necesita un widget global y D15 no encaja. Ver [decisions-log §6 deferred-publicwidget-body](docs/decisions-log.md#deferred-publicwidget-body).
- [ ] **Diferido — re-validar TTFB en producción real (Propuesta B)** — D20 implementado bajo medición localhost (~25 ms). Trigger reapertura: tras switchover Phase 10.6, ejecutar mediciones contra `https://avanzosc.es/`; si TTFB mediano >300 ms o load >700 ms, abrir Propuesta B (hold overlay until JS ready) como iteración A7. Ver [decisions-log §6 deferred-ttfb-prod](docs/decisions-log.md#deferred-ttfb-prod).
- [ ] **Diferido — acceso directo a `/contacto/gracias` cuenta como conversión falsa en Plausible (D25)** — sin workaround vigente; ruido aceptado v1. Trigger reapertura: si conteo de goals supera +20% el conteo real de `mail.mail` enviados (cross-check backend), migrar a flag de sesión (`request.session['contact_submitted']` set en controller + consume en template). Ver [decisions-log §6 deferred-q4-gracias-direct-access](docs/decisions-log.md#deferred-q4-gracias-direct-access).
- [ ] **Diferido — claim «STEM mayoritariamente femenino» en body `/conocenos` (B2)** — meta description ya limpia (commit `73933f4`); body sigue conteniendo ~6 menciones STEM/femenino. Riesgo factual = 0 mientras `robots.txt Disallow:/` (intencional pre-switchover). Trigger reapertura: **pre-switchover OBLIGATORIO** — sprint final de copy creativo decide entre eliminar el demográfico, reformular sin afirmaciones cuantitativas, o reescribir la sección. Sin trigger atendido, NO autorizar switchover. Ver [decisions-log §6 deferred-conocenos-stem-claim](docs/decisions-log.md#deferred-conocenos-stem-claim).
- [ ] **Diferido — Lighthouse Best Practices score 81-82/100 (audit N3+N4)** — 2 fallos con origen upstream Odoo 14 (`deprecations` en `web.assets_*` core + `valid-source-maps` por design Odoo). Sin workaround vigente, parche al core viola §10. Trigger reapertura: evaluación de migración a Odoo 15+/16+ (probablemente N3 cierra solo; N4 puede cambiar). Ver [decisions-log §6 deferred-lighthouse-best-practices-upstream](docs/decisions-log.md#deferred-lighthouse-best-practices-upstream).
- [ ] **Diferido — contraste insuficiente en `--brand-primary` (15 nodos C3 brand, Sprint B3 Path B)** — Sprint B3 cerró 13/28 nodos color-contrast (G2/G4 neutrales + G5 override Bootstrap nav-link); quedan 15 nodos brand: 12+1 botón `.btn-primary` (white-on-`#E85D2F`, ratio 3.47:1) + 2 `.s_avanzosc_contacto_info_link` (brand-on-white). Sin workaround. Trigger reapertura: brand source of truth disponible (manual de marca / SVG logo autoritativo, ya pendiente §13). Acoplado con «Hex finales del logo + SVG»: resolver los 3 a la vez. Recomendado cerrar pre-switchover (EAA 2025 vigente) pero no bloqueo mecánico. Ver [decisions-log §6 deferred-brand-primary-contrast](docs/decisions-log.md#deferred-brand-primary-contrast).

---

## 12. Convenciones de commits y scope

No-negociables operativos (complementan los técnicos de §10). Aplican a Claude principal, a cualquier subagente dispatched, y a futuros añadidos al proyecto.

1. **NO añadir trailer `Co-Authored-By:` a ningún commit.** Los commits son atribuidos al usuario que opera la herramienta. Excepción única: que el usuario lo pida explícitamente en una sesión concreta. La autorización NO se hereda entre sesiones.

2. **NO crear archivos fuera del scope literal de la tarea**, aunque «vengan bien» para tareas futuras. Si una tarea X.Y crea `foo.scss`, eso es lo único que crea, aunque el implementer prevea que `bar.scss` se necesitará en X.Z. Las dependencias se respetan en el orden del plan.

   **Aclaración**: si una tarea genera artefactos en una carpeta con `README` / index documentado (snapshots, smoke logs, etc.), **actualizar ese README es scope de la tarea, no scope creep**. Distinguir entre «no crear archivos no pedidos» (regla activa) y «mantener consistente la documentación de los archivos que sí pides» (parte del scope). Ejemplo: Task 0.2 crea 4 PNGs en `docs/superpowers/plans/snapshots/00-baseline/` → su README debe listarlas; Task 0.3 añade un PNG más a esa carpeta → su scope incluye actualizar el README con la nueva entrada.

3. **Verificar antes de crear**: si la tarea crea archivos en una carpeta, primero `ls` (o equivalente) para ver si ya existen. Si existen, **leer y extender**, no sobrescribir.

4. **Cada tarea tiene smoke test obligatorio post-implementación**: el módulo debe recargar sin errores ni warnings nuevos (comando en §7). Sin smoke test verde, la tarea no se cierra.

5. **El smoke test se ejecuta y se guarda en `docs/smoke-tests/<task-id>.log`** (ej: `docs/smoke-tests/0.1.log`). El log captura las **últimas 20 líneas del output** de Odoo tras `-u <module> --stop-after-init`. El commit que cierra la tarea incluye este archivo. Sin log, tarea no cierra.

   **Política de warnings toleradas**: el log se guarda íntegro. Cualquier warning **no listado** abajo debe investigarse antes de cerrar la tarea. Tolerado actualmente:
   - `DeprecationWarning: nodes.Node.traverse()` en `ir_module.py:128` — ruido del core Odoo 14, no afecta funcionalidad.

   Si aparece una warning recurrente nueva del core, se añade a esta lista en un commit `[DOC]` aparte.

6. **El smoke test se ejecuta SIEMPRE vía `./scripts/run-smoke.sh <task-id>`**, nunca invocando `odoo-bin` directamente. El script gestiona el ciclo «parar dev server → smoke → restart dev server con los mismos args», escribe `docs/smoke-tests/<task-id>.log` (regla #5) y devuelve exit code 1 si el output contiene `Traceback` o `ERROR`. Esta regla aplica a Claude principal y a cualquier subagente. El comando subyacente que ejecuta el script está documentado en §7 y solo es referencia interna; en flujo real se invoca por el script. **Garantía del script**: `exit 0` implica que el dev server responde HTTP 200/303 en `localhost:14070` tras el restart, no solo que el proceso esté vivo. Tres modos de fallo del restart se detectan con diagnóstico distinguido en stderr: «died immediately after restart», «died before listening on :14070», «alive but not listening on :14070».

7. **Reglas STOP de seguridad**: cuando una regla de las anteriores (o cualquier rule explícita en este documento) se dispara como «STOP», parar inmediatamente. Pero **la regla cubre un riesgo, no una condición sintáctica**. Si la investigación honesta demuestra que el riesgo NO aplica al caso concreto (p. ej., un xml_id en módulo distinto de `__export__/base` pero con `noupdate=true` que neutraliza la recreación tras delete), presentar la evidencia al usuario y pedir decisión humana — **no proceder en silencio ni saltarse la regla por interpretación propia**. La separación entre «condición que dispara el STOP» y «riesgo que la regla cubre» es responsabilidad del agente surfacearla; la decisión de continuar o respetar el STOP estricto es del usuario.

8. **Validar estado real del repo al arrancar sesión**: al iniciar una sesión nueva, especialmente tras compaction, ejecutar `git log -20 --oneline` y `git status` ANTES de fiarse del summary o de empezar trabajo. **El summary post-compaction es referencia útil pero no fuente de verdad — el repo lo es.** El summary describe el estado en el momento de la compactación, que puede estar horas o días detrás del HEAD real (p.ej. una sesión paralela committeó la fase siguiente mientras la compactación estaba en flight). Cross-check obligatorio: comparar el último commit con lo que el summary describe como «en flight». Si el commit ya existe en HEAD pero el summary dice «trabajando en X», el summary está stale — STOP, no escribir, preguntar al usuario qué hacer. Aplicar también a tasks/todos del system reminder: reflejan la lista de la conversación, no necesariamente el repo. Aprendizaje de incidente sesión 2026-04-29 (Phase 6 duplicada, ~30 min perdidos + records orfanos en BD).

**Política de añadidos a este documento**: cualquier sección nueva (§13, §14, …) va al final, NUNCA insertada en medio. Numeración estable = referencias estables.
