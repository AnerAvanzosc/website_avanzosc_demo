# QA bilingüe — capturas ES (Phase 9.1)

Inicial: 2026-04-29. 21 PNGs ES de las 7 páginas representativas (B2
reducido per decisión sesión 2026-04-29) × 3 viewports.

## Páginas representativas (B2)

- **home** — composición funnel completa (hero + 9 snippets).
- **industrial** — sectorial con hero + sector_specifics + caso éxito + CTA.
- **conocenos** — corporativa estándar (misión + valores + historia + equipo).
- **contacto** — corporativa con mapa OSM iframe (caso especial).
- **aviso-legal** — legal text-heavy.
- **kit-consulting** — ES-only (D5).
- **empleo** — corporativa con hero + lista perfiles + vacantes (estructura distinta).

## Nomenclatura

`<page>-<viewport>-es.png` con viewports `1280` / `768` / `375`.

## Verificación programática

Cada captura validada vía Playwright:
- Sin overflow horizontal: `document.documentElement.scrollWidth <= window.innerWidth`.
- 0 console errors al cargar.
- Hero animation forzada al estado final (overrides JS) para que el
  fullPage capture muestre el post-anim deterministicamente.
- Reveals + contadores + timeline igualmente forzados.

Estado todas las 21 capturas: ovf=false, dw <= vw, console errors = 0.

## Artefactos del screenshot capture (transientes)

- Override de `overflow: hidden` en html/body/#wrapwrap a `visible`
  para fullPage capture extendido.
- `.is-revealed` añadido a `[data-avanzosc-reveal]` programáticamente
  (sin esperar IO observers).
- `.s_avanzosc_contador_number` con texto = valor target + suffix.
- `.s_avanzosc_timeline_item` con `opacity:1; transform:none`.
- `.s_avanzosc_hero_claim` + chars + subtítulo + actions con
  `opacity:1; transform:none` (hero GSAP timeline forzado al final).
- `?lang=es_ES` query param para garantizar render ES contra cookie
  `frontend_lang=eu_ES` heredada de batch anterior.

Estos overrides son SOLO para captura visual; el render en sesión real
de usuario funciona correctamente con los IO observers + GSAP naturales.

## Capturas

| Página | 1280×800 | 768×1024 | 375×667 |
|---|---|---|---|
| home | home-1280-es.png | home-768-es.png | home-375-es.png |
| industrial | industrial-1280-es.png | industrial-768-es.png | industrial-375-es.png |
| conocenos | conocenos-1280-es.png | conocenos-768-es.png | conocenos-375-es.png |
| contacto | contacto-1280-es.png | contacto-768-es.png | contacto-375-es.png |
| aviso-legal | aviso-legal-1280-es.png | aviso-legal-768-es.png | aviso-legal-375-es.png |
| kit-consulting | kit-consulting-1280-es.png | kit-consulting-768-es.png | kit-consulting-375-es.png |
| empleo | empleo-1280-es.png | empleo-768-es.png | empleo-375-es.png |

- **Module commit:** Phase 9 closure HEAD
- **Date:** 2026-04-29
