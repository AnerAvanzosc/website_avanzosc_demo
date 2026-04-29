# QA bilingüe — capturas EU (Phase 9.2)

Inicial: 2026-04-29. 18 PNGs EU de las 6 páginas representativas (B2
reducido) × 3 viewports. **Sin kit-consulting** per D5 (programa
Red.es ES-only por audiencia hispanohablante; el switcher en `/kit-consulting`
ofrece `/eu_ES/kit-consulting` que rendea contenido ES literal — sin
strings traducibles para esa página).

## Páginas representativas (B2)

- **home** — composición funnel completa, EU.
- **industrial** — sectorial EU.
- **conocenos** — corporativa EU.
- **contacto** — corporativa EU + OSM map.
- **aviso-legal** — legal text-heavy. **Cuerpo en ES**, titulares H1 +
  subtítulos + H2 sección en EU. Per decisión sesión 2026-04-29 (E):
  legales fueron traducidos por capas — primero los titulares para
  Q3 gate; cuerpo completo EU pendiente Phase 9 extension cuando
  asesoría legal valide los textos ES base.
- **empleo** — corporativa con perfiles EU.

## Nomenclatura

`<page>-<viewport>-eu.png` con viewports `1280` / `768` / `375`.

## Verificación programática

Cada captura validada vía Playwright:
- Sin overflow horizontal.
- 0 console errors.
- Hero animation forzada al estado final.

Estado todas las 18 capturas: ovf=false, dw <= vw, console errors = 0.

## Hallazgo conocido — caso éxito

El bloque `s_avanzosc_caso_exito` (archetype 1 en home) rendea **9
strings en ES sobre fondo EU** porque las EU drafts del archetype 1
fueron añadidas a `i18n/eu.po` en Phase 9.5 (sesión 2026-04-29) pero
están con flag `fuzzy` — Odoo aplica `msgstr` aunque sea fuzzy, por lo
que la home `/eu_ES/` ya rendea las 9 strings en EU draft. Los
archetypes 2-8 NO tienen EU drafts (per [?] #7 spec pendiente —
selección final del archetype activo).

## Artefactos del screenshot capture (transientes)

Idénticos a `09-qa-es/README.md` — overrides de overflow + reveal +
contador + timeline + hero force. Sin `?lang=` query (URLs con prefijo
`/eu_ES/` ya garantizan render EU).

## Capturas

| Página | 1280×800 | 768×1024 | 375×667 |
|---|---|---|---|
| home | home-1280-eu.png | home-768-eu.png | home-375-eu.png |
| industrial | industrial-1280-eu.png | industrial-768-eu.png | industrial-375-eu.png |
| conocenos | conocenos-1280-eu.png | conocenos-768-eu.png | conocenos-375-eu.png |
| contacto | contacto-1280-eu.png | contacto-768-eu.png | contacto-375-eu.png |
| aviso-legal | aviso-legal-1280-eu.png | aviso-legal-768-eu.png | aviso-legal-375-eu.png |
| empleo | empleo-1280-eu.png | empleo-768-eu.png | empleo-375-eu.png |

- **Module commit:** Phase 9 closure HEAD
- **Date:** 2026-04-29
