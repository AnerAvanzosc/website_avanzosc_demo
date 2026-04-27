# Baseline snapshots

Inicial: 2026-04-27. Carpeta de capturas baseline + snapshots tras hitos de Phase 0
(scaffold, fonts, libs externas). Sirve de before/after reference para futuras tareas
visuales. Cada captura indica su tarea de origen y el commit del módulo en ese punto.

---

## avanzosc-actual-1280.png

**What it represents:** Home page of the live production site `https://avanzosc.es` as
it existed on the capture date, in a desktop viewport of 1280×800 px. Shows the current
Odoo generic theme: header with navigation (Inicio, Soluciones sectoriales, Kit
Consulting, Tienda, Cursos, Conócenos, Noticias, FAQ), a large text hero ("Odoo suit de
aplicaciones, solución integral para la empresa") and the Kit Digital banner. This is
the "before" baseline for the entire redesign.

- **URL:** `https://avanzosc.es`
- **Viewport:** 1280×800 px
- **Module commit:** N/A (live production site)
- **Date:** 2026-04-27

---

## avanzosc-actual-375.png

**What it represents:** Home page of the live production site `https://avanzosc.es` in
a mobile viewport of 375×667 px. Shows the current site's responsive behaviour: Odoo
logo top-left, hamburger menu top-right, hero image with overlaid "Avanzosc S.L. /
Consultoría de software desde 2008" text. Reference for mobile baseline before any
responsive work.

- **URL:** `https://avanzosc.es`
- **Viewport:** 375×667 px
- **Module commit:** N/A (live production site)
- **Date:** 2026-04-27

---

## local-scaffold-1280.png

**What it represents:** Home page of the local Odoo 14 Community instance
`http://localhost:14070/` after Task 0.1 (module scaffold created and installed).
The module at this point contains only the directory skeleton and `__manifest__.py`
with `depends=['website','website_sale','website_slides']` — no custom layout, no
custom pages, no SCSS, no JS. The site renders the default Odoo `website` theme
("YOUR WEBSITE" placeholder, default footer). This is the "Day 0 scaffold" baseline
for the local development environment.

- **URL:** `http://localhost:14070/`
- **Viewport:** 1280×800 px
- **Module commit:** `d171e413555486bcad27d578b3dccf3baaef8b99`
- **Date:** 2026-04-27

---

## local-scaffold-375.png

**What it represents:** Same local Odoo 14 scaffold as above, in a mobile viewport of
375×667 px. Shows the default Odoo `website` responsive behaviour before any custom
layout work: mobile header with hamburger, "Contact Us" CTA, and the default footer
links. Reference for mobile baseline of the scaffold state.

- **URL:** `http://localhost:14070/`
- **Viewport:** 375×667 px
- **Module commit:** `d171e413555486bcad27d578b3dccf3baaef8b99`
- **Date:** 2026-04-27

---

## local-scaffold-with-fonts-1280.png

**What it represents:** Home page of the local Odoo 14 instance after **Task 0.3**
(Google Fonts + Lucide CDN registered en `<head>` vía herencia de `web.layout`). Las
fuentes se cargan pero ninguna regla SCSS las aplica todavía a elementos concretos
(eso es Task 0.5), por lo que el render visual es prácticamente idéntico al de
`local-scaffold-1280.png`. Sirve como checkpoint: confirma que la inyección en `<head>`
no rompe el layout default de Odoo.

- **URL:** `http://localhost:14070/`
- **Viewport:** 1280×800 px
- **Module commit:** Task 0.3 HEAD (commit `8f6676b` o posterior, ver `git log`)
- **Date:** 2026-04-27

---

## local-scaffold-with-libs-1280.png

**What it represents:** Home page del local Odoo 14 tras **Task 0.4** (GSAP 3.12.5 +
ScrollTrigger 3.12.5 + Splitting.js 1.0.6 + Lenis 1.0.42 cargados como libs externas
en `<head>`, sin instanciar todavía). Tampoco hay cambio visual respecto al baseline
de fonts: las librerías exponen sus globales (`gsap`, `ScrollTrigger`, `Splitting`,
`Lenis`) pero ningún snippet las consume aún. Verificación visual de que registrar
los CDN no afecta al render base.

- **URL:** `http://localhost:14070/`
- **Viewport:** 1280×800 px
- **Module commit:** Task 0.4 HEAD (commit `2c73f6e` o posterior, ver `git log`)
- **Date:** 2026-04-27

---

## local-scaffold-with-typography-1280.png

**What it represents:** Home page del local Odoo 14 tras **Task 0.5** (SCSS base —
`_variables.scss` con la paleta §9.3, `_mixins.scss` con `@mixin reduced-motion`,
`_typography.scss` con la jerarquía §9.4: Inter en body, Space Grotesk en h1-h3,
JetBrains Mono en code/pre). Las reglas tipográficas están compiladas en el bundle
y aplicadas al `<body>` (computed `font-family` = Inter), pero el tema Odoo default
no incluye `<h1>` ni `<code>` en la home, por lo que el cambio visual perceptible
respecto a los baselines anteriores es mínimo (texto del footer "Useful Links",
"About us" etc. ahora sí en Inter). Sirve de checkpoint pre-snippet.

- **URL:** `http://localhost:14070/`
- **Viewport:** 1280×800 px
- **Module commit:** Task 0.5 HEAD (commit `8ed1563` o posterior, ver `git log`)
- **Date:** 2026-04-27

---

## local-scaffold-with-typography-375.png

**What it represents:** Misma vista que la anterior en viewport mobile 375×667 px.
Comportamiento responsive del tema Odoo default ya con los assets SCSS de Task 0.5
cargados. Hamburger menu visible, "Contact Us" CTA, footer apilado en una columna.
Cambio tipográfico aplicable al texto del footer.

- **URL:** `http://localhost:14070/`
- **Viewport:** 375×667 px
- **Module commit:** Task 0.5 HEAD (commit `8ed1563` o posterior, ver `git log`)
- **Date:** 2026-04-27

---

## local-scaffold-with-lenis-1280.png

**What it represents:** Home page del local Odoo 14 tras **Task 0.6** (Lenis 1.0.42
inicializado en `static/src/js/main.js` dentro del `publicWidget` `AvanzoscRoot`).
El global `window.lenis` queda expuesto para diagnóstico. Render visual idéntico al
baseline anterior — Lenis afecta al comportamiento del scroll (smooth), no al layout.
Checkpoint: confirma que la inicialización de Lenis no introduce errores JS ni rompe
el render del tema Odoo default. Verificado: `typeof window.lenis === "object"`,
`window.lenis.constructor.name === "Lenis"`, `typeof window.lenis.raf === "function"`.

- **URL:** `http://localhost:14070/`
- **Viewport:** 1280×800 px
- **Module commit:** Task 0.6 HEAD (ver `git log`)
- **Date:** 2026-04-27
