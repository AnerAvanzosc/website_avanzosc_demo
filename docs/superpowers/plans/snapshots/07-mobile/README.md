# Mobile header snapshots — Phase 7

Inicial: 2026-04-29. Capturas tras Phase 7 (header mobile <992px:
hamburger + user icon + overlay con menú vertical + acordeón Soluciones
+ switcher). Decisiones cerradas en discovery sesión 2026-04-29:
breakpoint Bootstrap-`lg` (<992px), B1 acordeón cerrado por defecto,
fade 200ms (sólo opacity), switcher cierra+navega, X+Escape+link
clicks como cierre (NO click-outside).

**Artefactos del screenshot capture (transientes, NO afectan render real):**

- Tras click programático del hamburger en JS (`document.querySelector('.s_avanzosc_hamburger').click()`),
  esperar 250ms (duración de la transición fade) antes de capturar para
  que `opacity:1` esté aplicado.
- En el screenshot del overlay abierto el viewport muestra solo la primera
  pantalla; el contenido del overlay puede continuar más abajo (scroll
  interno del overlay vía `overflow-y: auto`).
- En la captura «Soluciones expandido» el chevron está rotado 180° por
  la transición CSS — visible en la imagen como `^` arriba-derecha del
  item «Soluciones».

---

## header-mobile-375.png

**What it represents:** home `/` en viewport mobile 375×667 (iPhone-sized)
con el overlay cerrado. Muestra el header en estado «idle mobile»:

- Logo «Your Website» a la izquierda.
- Switcher de idioma «Español ▾» (dropdown native Odoo, único elemento
  del header default que se mantiene visible en mobile sin
  intervención).
- Hamburger Lucide `menu` 32×32 + user icon Lucide `user` 32×32 a la
  derecha. Ambos con `aria-label` y `<span class="s_avanzosc_sr_only">`
  para accesibilidad.

**Verificaciones:**
- `s_avanzosc_hamburger` computed `display: flex` ✓
- `s_avanzosc_acceso_clientes_mobile` computed `display: flex` ✓
- `s_avanzosc_acceso_clientes` (botón desktop) computed `display: none` ✓
- Overlay `display: block` + `opacity: 0` (oculto via opacity, en DOM) ✓
- Console errors: 0 ✓

- **URL:** `http://localhost:14070/`
- **Viewport:** 375×667 px
- **Sesión:** pública (sin login)
- **Module commit:** Phase 7 closure HEAD
- **Date:** 2026-04-29

---

## header-mobile-375-overlay-open.png

**What it represents:** overlay activado por click en hamburger.
Cubre todo el viewport (`position: fixed; inset: 0; z-index: 1050`).

**Estructura del overlay capturada:**
1. Botón close (X) Lucide arriba-derecha, con focus ring (foco se mueve
   a X automáticamente al abrir per accesibilidad).
2. 7 items del menú vertical:
   - Inicio
   - Soluciones (con chevron ▾ — acordeón cerrado por defecto)
   - Tienda
   - Formación
   - Contacto
   - Conócenos
   - Empleo
3. Switcher de idioma flat (Euskara | Español) al fondo, con borde
   superior. «Español» subrayado naranja como indicador de idioma activo
   (clase `.is-active`).

**Verificaciones tras click hamburger:**
- Overlay `is-open` ✓ + `opacity: 1` ✓
- Body `s_avanzosc_mobile_overlay_open` ✓ (scroll lock activo)
- Foco en `.s_avanzosc_mobile_overlay_close` (X) ✓
- Hamburger `aria-expanded="true"` ✓
- Tras Escape: overlay vuelve a `opacity: 0`, body unlocked ✓
- Console errors: 0 ✓

- **URL:** `http://localhost:14070/`
- **Viewport:** 375×667 px
- **Module commit:** Phase 7 closure HEAD
- **Date:** 2026-04-29

---

## header-mobile-375-overlay-soluciones-expanded.png

**What it represents:** overlay con el acordeón «Soluciones» expandido
tras click en su botón.

**Cambios visibles vs `header-mobile-375-overlay-open.png`:**
- Chevron rotado 180° (`^` en lugar de `▾`).
- 4 sub-items aparecen indented bajo «Soluciones»:
  - Industrial
  - Distribución
  - Servicios
  - Academias

**Comportamiento sin animación de altura** (per CLAUDE.md §5 — no animar
`height`): el toggle es `display: none` ↔ `display: block` instantáneo.
Solo el chevron tiene transición (transform: rotate, GPU-friendly,
200ms ease-out).

**Verificaciones:**
- `.s_avanzosc_mobile_overlay_dropdown` clase `.is-expanded` ✓
- `.s_avanzosc_mobile_overlay_submenu` computed `display: block` ✓
- Toggle `aria-expanded="true"` ✓

- **URL:** `http://localhost:14070/`
- **Viewport:** 375×667 px
- **Module commit:** Phase 7 closure HEAD
- **Date:** 2026-04-29

---

## header-tablet-768.png

**What it represents:** home `/` en viewport tablet 768×1024
(iPad-sized) con el overlay cerrado. **Comportamiento idéntico a
mobile 375** porque Bootstrap-`lg` empieza a 992px — debajo de eso
el menú desktop se colapsa y nuestros botones mobile se muestran.

Diferencias visuales vs 375:
- Hero claim «Odoo industrial de verdad, desde 2008.» cabe en 2 líneas
  (en 375 cabe en 3).
- Los pilares (2008 / 600+ / STEM) se ven horizontalmente en 3 columnas
  ya en este viewport (Bootstrap `col-md-4` from 768).

**Verificaciones:**
- `viewport: 768x1024` ✓
- `s_avanzosc_hamburger` display: flex ✓
- `s_avanzosc_acceso_clientes_mobile` display: flex ✓
- `s_avanzosc_acceso_clientes` (desktop btn) display: none ✓

- **URL:** `http://localhost:14070/`
- **Viewport:** 768×1024 px
- **Module commit:** Phase 7 closure HEAD
- **Date:** 2026-04-29

---

## header-tablet-768-overlay-open.png

**What it represents:** overlay abierto en tablet 768. Mismo layout
vertical que mobile 375 — overlay full-screen con menú vertical, sin
adaptación condicional al viewport tablet (decisión: tratamos
375-991px como una sola «mobile experience», no diferenciamos tablet).

Visible: 7 items + switcher Euskara | Español al fondo. El extra
vertical space comparado con 375 deja respiro generoso entre items.

- **URL:** `http://localhost:14070/`
- **Viewport:** 768×1024 px
- **Module commit:** Phase 7 closure HEAD
- **Date:** 2026-04-29

---

## header-desktop-1280.png

**What it represents:** home `/` en viewport desktop 1280×800. **Control
visual** que confirma que Phase 7 NO ha alterado el desktop:

- Logo + 7 menús horizontales (Inicio, Soluciones▾, Tienda, Formación,
  Contacto, Conócenos, Empleo) + carrito + switcher idioma «Español▾»
  + botón «Acceso clientes» con texto completo en background brand-primary.
- Hamburger + user icon mobile **NO visibles** (parent container
  `.s_avanzosc_header_mobile_actions` con `display: none` por defecto;
  override `inline-flex` solo activo `<992px`).
- Overlay div en DOM pero con `display: none !important` por
  `@media (min-width: 992px)` — defensa CSS-side aunque JS abriera por
  error.

Comparable visualmente con `snapshots/01-layout/header-1280-scrolled.png`
y `snapshots/04-home/home-1280-es.png` (mismo header desktop). Phase 7
no cambia este estado.

**Verificaciones:**
- `s_avanzosc_header_mobile_actions` computed `display: none` ✓
- `s_avanzosc_acceso_clientes` computed `display: inline-block` ✓
  + textContent === "Acceso clientes" ✓
- `s_avanzosc_mobile_overlay` computed `display: none` ✓

- **URL:** `http://localhost:14070/`
- **Viewport:** 1280×800 px
- **Module commit:** Phase 7 closure HEAD
- **Date:** 2026-04-29
