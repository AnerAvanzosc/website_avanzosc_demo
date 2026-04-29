# Home snapshots — Phase 4

Inicial: 2026-04-29. Capturas tras Phase 4 (composición de la home en
`/`). Sirve de evidencia visual del estado completo del sitio en `/`
con los 9 snippets en orden funnel B2B y EU bilingüe. Mismo formato
heading-per-entry que los demás folders de `snapshots/`.

---

## home-1280-es.png

**What it represents:** Home `/` en castellano (lang `es_ES`) tras
Phase 4. Captura full-page (~4480px de alto) que recoge los 9 snippets
del funnel home en orden:

1. Hero (claim «Odoo industrial de verdad, desde 2008.» + 2 CTAs).
2. Pilares (2008 / 600+ / STEM con 1-line cada uno).
3. Sectores (grid 2x2: Industrial, Distribución, Servicios, Academias).
4. CTA Kit Consulting (banner amarillo brand-accent).
5. Contador (17 / 600+ / 4).
6. Caso éxito (archetype 1 — «Fabricante metal-mecánico» con SVG dashboard).
7. Timeline (8 hitos trayectoria 2008-Hoy, horizontal layout).
8. Equipo (SVG abstracto + copy + 4 stats).
9. CTA Contacto (dark bg, «¿Hablamos?» + 2 CTAs).

Más header sticky arriba y footer 4-col abajo (Phase 1 + Phase 1.4).

**Implementación**: el view `website_avanzosc_demo.homepage_avanzosc`
extiende `website.homepage` core via xpath inheritance, reemplazando
el placeholder `<div id="wrap">` empty por nuestros 9 t-calls. La
estrategia preserva los 2 page records core de Odoo (id 1 global +
id 3 per website) que comparten el view.

**Artefactos del screenshot capture (transientes, NO afectan render real):**

- Override temporal de `overflow: hidden` en html/body/#wrapwrap a
  `visible` para que `fullPage` de Playwright capture el documento
  entero (sin esto, queda clamped al primer viewport per Odoo's setup).
- Force `is-revealed` class en todos los `[data-avanzosc-reveal]`
  para neutralizar el initial-hidden state que IO toggle al scrollear
  — sin esta force, los snippets debajo del primer viewport quedan
  opacity:0 porque sus IO observers no se disparan en una full-page
  capture sin scroll real.
- Force `paintFinal` en los counters (`s_avanzosc_contador_number`)
  porque rAF loop solo dispara con IO — sin force, los números
  quedan en su valor inicial 0.
- Force `opacity: 1; transform: none` en `.s_avanzosc_timeline_item`
  porque la animación GSAP se dispara solo con IO también.

Estos overrides son SOLO para la captura visual; el render en sesión
real de usuario funciona correctamente con sus IO observers naturales.

- **URL:** `http://localhost:14070/`
- **Viewport:** 1280×800 px (fullPage extended ~4480px)
- **Sesión:** pública (sin login)
- **Module commit:** Phase 4 closure HEAD (ver `git log`)
- **Date:** 2026-04-29

---

## home-1280-eu.png

**What it represents:** Home `/eu_ES/` en euskera (lang `eu_ES`).
Mismo layout que `home-1280-es.png`. Las traducciones DRAFT de Phase 2
+ Phase 3 se aplican automáticamente:

- Hero claim «Benetako Odoo industriala, 2008tik.» (validated D2,
  no flag fuzzy).
- Subtítulo, CTAs, navegación, footer en EU.
- Sectores: Industriala, Banaketa, Zerbitzuak, Akademiak.
- CTA Kit Consulting subtítulo en EU.
- Contador 1-lines en EU.
- Timeline 8 hitos en EU.
- Equipo párrafo + stats labels en EU.
- CTA Contacto «Hitz egingo dugu?» + EU CTAs.

**Limitación conocida:** la sección «Caso éxito» (archetype 1) renderiza
el copy en castellano. Per decisión Task 3.6 commit body, las EU
translations de los 8 archetypes están diferidas hasta cerrar la
selección final del archetype activo en producción — solo el activo
visible en home se traduce. Hoy v1 muestra ES en esa sección sobre
fondo EU del resto. Aceptado documentado.

- **URL:** `http://localhost:14070/eu_ES/`
- **Viewport:** 1280×800 px (fullPage extended ~4474px)
- **Sesión:** pública (sin login)
- **Module commit:** Phase 4 closure HEAD
- **Date:** 2026-04-29

---

## home-mobile-375-es.png

**What it represents:** Home `/` en castellano a viewport mobile
375×667 (iPhone-sized). Captura full-page (~7674px) que recoge los 9
snippets stacked verticalmente.

**Verificación responsive de Phase 4:**

- Header navbar: hamburger `☰` activado per Bootstrap `navbar-expand-lg`
  (breakpoint 992px).
- Hero: claim H1 fluid `clamp(2.5rem, calc(5vw + 1rem), 4.5rem)` cae
  a ~2.5rem (40px) — más compacto pero legible.
- Pilares: 3 cols apiladas (col-12 col-md-4 → col-12 mobile).
- Sectores: 4 cards apiladas (col-12 col-md-6 → col-12 mobile).
- Contador: 3 numbers apilados.
- Caso éxito: text + SVG visual, ambos en col-12 (col-lg-7 / col-lg-5
  → col-12 each en mobile).
- Timeline: layout VERTICAL con dots a la izquierda + line vertical
  conectando items (responsive switch en `_timeline.scss`).
- Equipo: SVG arriba, copy debajo (col-lg-5 / col-lg-7 → col-12).
- CTAs apiladas con `flex-wrap: wrap`.
- Footer: 4 cols apiladas (col-lg-3 col-md-6 → col-12 mobile).

**Refinamiento mobile real es scope de Phase 7** (per CLAUDE.md plan).
Esta captura confirma que el Bootstrap responsive base no rompe en
375px y todo el contenido es accesible. Detalles tipográficos, gaps,
y posibles ajustes específicos de UX mobile se cubren en Phase 7.

- **URL:** `http://localhost:14070/`
- **Viewport:** 375×667 px (fullPage extended ~7674px)
- **Sesión:** pública (sin login)
- **Module commit:** Phase 4 closure HEAD
- **Date:** 2026-04-29
