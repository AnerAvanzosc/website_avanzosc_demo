# Sectoriales snapshots — Phase 5

Inicial: 2026-04-29. Capturas tras Phase 5 (4 páginas sectoriales
`/industrial`, `/distribucion`, `/servicios`, `/academias`). Sirven de
evidencia visual de la estructura común D1 (hero adaptado +
`s_avanzosc_sector_specifics` + caso de éxito archetype-filtered + CTA
contacto) y de la verificación bilingüe ES/EU. Mismo formato
heading-per-entry que los demás folders de `snapshots/`.

Estructura común de las 4 páginas (per D1):
1. Hero adaptado (claim + subtítulo + 2 CTAs sectoriales). CTA primario
   apunta a `#capabilities` (anchor a la siguiente sección).
2. `s_avanzosc_sector_specifics` con `sector_key` parametrizado, sección
   con `id="capabilities"` para el anchor del hero.
3. `s_avanzosc_caso_exito` con `archetype_id` filtrado por sector
   (1 industrial, 5 distribución, 7 servicios, 8 academias).
4. `s_avanzosc_cta_contacto` (común a todas las páginas v1).

Header sticky arriba y footer 4-col abajo (Phase 1).

**Artefactos del screenshot capture (transientes, NO afectan render real):**

- Override temporal de `overflow: hidden` en html/body/#wrapwrap a
  `visible` para que `fullPage` de Playwright capture el documento
  entero (sin esto, queda clamped al primer viewport per Odoo's setup).
- Force `is-revealed` class en todos los `[data-avanzosc-reveal]` para
  neutralizar el initial-hidden state que IO toggle al scrollear — sin
  esta force, las secciones quedan opacity:0 porque sus IO observers
  no se disparan en una full-page capture sin scroll real.

Estos overrides son SOLO para la captura visual; el render en sesión
real de usuario funciona correctamente con sus IO observers naturales.

---

## industrial-1280-es.png

**What it represents:** página sectorial `/industrial` en castellano
(lang `es_ES`) tras Phase 5. Captura full-page que recoge:

- Hero: claim «Odoo industrial en planta, no en PowerPoint.», subtítulo
  «MES, MRP, trazabilidad y mantenimiento. Integración con PLCs, SCADA
  y balanzas. Equipo con experiencia real en planta.», CTAs «Ver
  capacidades» (anchor `#capabilities`) + «Hablar con un técnico» (`/contacto`).
- Sector specifics: «Capacidades industriales» + 6 items
  (MES/MRP, trazabilidad, calidad, mantenimiento, PLCs/balanzas,
  compliance).
- Caso éxito archetype id=1 — «Fabricante metal-mecánico (50-200
  empleados)» con SVG dashboard.
- CTA contacto «¿Hablamos?» dark.

- **URL:** `http://localhost:14070/industrial`
- **Viewport:** 1280×800 px (fullPage extended)
- **Sesión:** pública (sin login)
- **Module commit:** Phase 5 closure HEAD (ver `git log`)
- **Date:** 2026-04-29

---

## distribucion-1280-es.png

**What it represents:** página sectorial `/distribucion` en castellano.
Misma estructura que `industrial-1280-es.png`. Hero claim «Almacén,
picking y rutas. Sin Excel intermedios.». Sector specifics
«Capacidades de distribución» + 6 items (WMS, rutas, POS multitienda,
sync marketplaces, EDI, listas de precios). Caso éxito archetype id=5
— retail multitienda.

- **URL:** `http://localhost:14070/distribucion`
- **Viewport:** 1280×800 px (fullPage extended)
- **Sesión:** pública (sin login)
- **Module commit:** Phase 5 closure HEAD
- **Date:** 2026-04-29

---

## servicios-1280-es.png

**What it represents:** página sectorial `/servicios` en castellano.
Hero claim «Proyectos, partes y facturación recurrente.». Sector
specifics «Capacidades para empresas de servicios» + 6 items
(proyectos, partes mobile, facturación recurrente, helpdesk SLA,
planning geolocalizado, reportería). Caso éxito archetype id=7 —
servicio IT/SAT con técnicos en ruta.

- **URL:** `http://localhost:14070/servicios`
- **Viewport:** 1280×800 px (fullPage extended)
- **Sesión:** pública (sin login)
- **Module commit:** Phase 5 closure HEAD
- **Date:** 2026-04-29

---

## academias-1280-es.png

**What it represents:** página sectorial `/academias` en castellano.
Hero claim «Matrículas, calendarios y evaluaciones. En un solo Odoo.».
Sector specifics «Capacidades para academias y centros» + 6 items
(matriculación, calendarios, evaluaciones, portal familias, pagos
recurrentes, e-learning). Caso éxito archetype id=8 — grupo educativo
multicentro.

- **URL:** `http://localhost:14070/academias`
- **Viewport:** 1280×800 px (fullPage extended)
- **Sesión:** pública (sin login)
- **Module commit:** Phase 5 closure HEAD
- **Date:** 2026-04-29

---

## industrial-1280-eu.png

**What it represents:** página sectorial `/eu_ES/industrial` en euskera
(lang `eu_ES`). Mismo layout que `industrial-1280-es.png`. Las
traducciones DRAFT de Phase 2 + Phase 3 + Phase 5 se aplican
automáticamente:

- Hero claim «Odoo industriala lantegian, ez PowerPoint-en.», subtítulo
  EU, CTAs «Gaitasunak ikusi» / «Teknikari batekin hitz egin».
- Sector specifics: «Industria-gaitasunak» + intro + 6 items en EU
  (MES eta MRP, lote/serie trazabilitatea, kalitatea, mantentze
  prebentibo, PLC eta balantzekin, sektoreko compliance).
- Navegación + footer: traducidos via i18n/eu.po.
- CTA contacto: «Hitz egingo dugu?» + EU CTAs.

**Refactor de Phase 5 documentado**: los strings de
`s_avanzosc_sector_specifics` (4 títulos + 4 intros + 24 items = 32
total) inicialmente vivían dentro de un Python dict literal en
`t-value`, lo cual NO es extraíble por la i18n de Odoo (solo se
extraen los nodos QWeb con texto contenido). Refactorizado en Phase 5
a `<t t-if/t-elif>` blocks con cada string como contenido textual de
nodo. Validado: las 32 strings ya aparecen como msgid en `i18n/eu.po`
con flag fuzzy DRAFT pendiente de revisión lingüística por equipo
Avanzosc.

**Limitación conocida — sección caso éxito:** la sección renderiza el
copy del archetype en castellano sobre fondo EU. Mismo patrón que la
home (Phase 4 README): el dict de archetypes en
`s_avanzosc_caso_exito` aún usa el patrón Python dict
`t-value` para los 8 archetypes; sus strings no son extraíbles. Phase 5
toca solo `sector_specifics`; reemplazar el patrón en `caso_exito`
queda fuera de scope (decisión: refactor diferido al elegir el
archetype activo final per cliente, una vez la galería se reduzca a
los reales).

**Limitación conocida — slugs URL EU:** los slugs traducidos al euskera
(`/eu/industriala`, `/eu/banaketa`, `/eu/zerbitzuak`, `/eu/akademiak`,
per D2) están registrados en `ir.translation` para el campo
`website.page.url` y se renderizan correctamente desde `url_for()` (en
links + canonicals). Sin embargo, las URLs traducidas NO matchean en el
routing de Odoo 14 (`/eu_ES/industriala` → 404), porque el dispatcher
busca el path source-lang y solo aplica la traducción para output. La
captura usa `/eu_ES/industrial` (slug ES sobre lang EU) que es la
forma actualmente accesible. Aliasing real de slugs EU requeriría
`website.rewrite` o page records duplicados — diferido a Phase 7.

- **URL:** `http://localhost:14070/eu_ES/industrial`
- **Viewport:** 1280×800 px (fullPage extended)
- **Sesión:** pública (sin login)
- **Module commit:** Phase 5 closure HEAD
- **Date:** 2026-04-29
