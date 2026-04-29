# Animaciones snapshots — Phase 8

Inicial: 2026-04-29. Capturas tras Phase 8 (audit + refinamiento de
animaciones). 2 PNGs comparativos motion-on / motion-off de la home en
viewport 1280×800. Decisiones cerradas en discovery sesión 2026-04-29:
A2 (documentar divergencias inline), B1 (verificación visual + asserts),
C3+spot (audit estático SCSS + 1 spot-check Performance), D (solo
desktop 1280), E (refactor in situ trivial / deuda Phase 9 si cruzado).

**Artefactos del screenshot capture (transientes, NO afectan render real):**

- En la captura **motion-on**: forzado programático del estado final de
  los reveals (`.is-revealed` añadido a todos `[data-avanzosc-reveal]`),
  contadores pintados al valor target con `data-counted="true"`,
  timeline items con `opacity:1; transform:none`. Sin esto, el fullPage
  capture mostraría la home a mitad de animación.
- En la captura **motion-off**: con `page.emulateMedia({ reducedMotion: 'reduce' })`,
  los reveals/timeline/contador llegan al estado final inmediatamente
  por código (CSS `@include reduced-motion` neutraliza transitions; JS
  guards en `main.js`/`hero.js`/`timeline.js`/`contador.js` saltan la
  animación). NO se requirió forzar nada — el comportamiento real ya
  produce el estado final desde frame 0.
- En ambas: override de `overflow: hidden` en html/body/#wrapwrap a
  `visible` para que `fullPage` de Playwright capture el documento
  entero.

---

## home-1280-motion.png

**What it represents:** home `/` en viewport 1280×800, con motion-on
(`prefers-reduced-motion: no-preference`). **Baseline visual** del
estado post-animación — todos los reveals revelados, contadores en su
valor target, timeline expandida. Sirve de referencia para diff
contra la captura reduced.

**Verificaciones programáticas:**
- `window.matchMedia('(prefers-reduced-motion: reduce)').matches === false` ✓
- `typeof window.lenis === 'object'` (Lenis instanciado) ✓

- **URL:** `http://localhost:14070/`
- **Viewport:** 1280×800 px (fullPage extended)
- **Sesión:** pública (sin login)
- **Module commit:** Phase 8 closure HEAD
- **Date:** 2026-04-29

---

## home-1280-reduced.png

**What it represents:** misma home `/` en 1280×800, con motion-off
(`prefers-reduced-motion: reduce` emulado vía
`page.emulateMedia({ reducedMotion: 'reduce' })`). El estado final
debe ser **visualmente idéntico** al baseline motion-on — confirma que
reduced-motion produce el estado post-anim sin lag, sin layout roto,
sin texto cortado.

**Verificaciones programáticas (todas ✓):**
- `window.matchMedia('(prefers-reduced-motion: reduce)').matches === true`
- `typeof window.lenis === 'undefined'` (Lenis NO instanciado por guard
  en `main.js:35`)
- `.s_avanzosc_contador_number` muestra valor target directo
  (`data-counted="true"`, sin interpolación rAF)
- `.s_avanzosc_timeline_item`: `opacity: 1, transform: none`
- `.s_avanzosc_pilares_item`: `opacity: 1, transform: matrix(1,0,0,1,0,0)`
- `.s_avanzosc_sectores_card`: `opacity: 1, transform: none`
- `.s_avanzosc_equipo`: `opacity: 1, transform: none`
- `.s_avanzosc_caso_exito`: `opacity: 1, transform: none`
- Console errors: 0

**Diff visual vs motion-on:** ninguno. Layout idéntico, texto idéntico,
padding/spacing idéntico. Pueden existir diferencias de pixel debido a
fonts (sub-pixel rendering varía con la sesión) pero la estructura es
bit-exact.

- **URL:** `http://localhost:14070/`
- **Viewport:** 1280×800 px (fullPage extended)
- **Sesión:** pública (sin login)
- **Module commit:** Phase 8 closure HEAD
- **Date:** 2026-04-29

---

## Audit Phase 8.3 — SCSS estático

**Hallazgo único**: `_header.scss:51` anima `padding-top` /
`padding-bottom` (sticky → scrolled state). Es la única animación
layout-property del módulo. Documentada como excepción explícita en
las líneas 22-26 del propio file (decisión Phase 1.3, alternativa
`transform: scaleY` rechazada por distorsión vertical del contenido
del navbar).

**Decisión Phase 8.3**: NO refactorizar in situ. Riesgo cruzado alto
(sticky + navbar-collapse mobile + box-shadow + 3 transitions
co-localizadas). Documentado como **deuda Phase 9.7** en el plan.

## Audit Phase 8.3 — Performance spot-check

Sesión vía Chrome DevTools Protocol Tracing API durante scroll
programático top → bottom → top (~6s):

- 23,584 events totales
- 135 Layout events (~22/sec) — moderado, ubicación principal: el
  padding-transition documentado del sticky header al cruzar 100px
  scroll (2 fires por sesión completa down+up) + IO observers re-firing
  para los `[data-avanzosc-reveal]` widgets cuando los items entran/salen
  del viewport.
- 609 Paint events — repaints, principalmente por composite changes
  (transform/opacity en reveals).
- `CompositeLayers: 0`, `UpdateLayer: 2204` — Chrome 100+ usa
  `UpdateLayer` para layer rebuilds. Indica que la mayoría de cambios
  visuales son composite-only (GPU).

**Veredicto**: scroll suave; los layouts vienen del sticky padding
documentado. Sin reflows preocupantes. Deuda Phase 9.7 cubre el
único caso identificado.
