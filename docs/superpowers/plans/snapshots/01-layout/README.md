# Layout snapshots — Phase 1

Inicial: 2026-04-28. Capturas tras los hitos de la fase 1 (layout base: menú,
header desktop, footer, sticky behaviour). Sirve de before/after reference para
las 7 tareas de Phase 1 (1.1–1.7) y para diff visual contra los baselines de
`00-baseline/`. Cada captura indica su tarea de origen y el commit del módulo
en ese punto. Mismo formato heading-per-entry que `00-baseline/README.md`
(formato canónico para todos los folders de snapshots).

---

## menu-1280-c1-final.png

**What it represents:** Home page del local Odoo 14 tras **Task 1.1 (C.1
post_init_hook approach)**. Muestra el navbar con la jerarquía de menú
correcta: 7 items top-level nuestros (Inicio, Soluciones sectoriales con
indicador ▼, Tienda, Formación, Conócenos, Trabaja con nosotros, Contacto)
+ 4 defaults Odoo restantes (Shop, Blog, Courses, Contact us — Home se
eliminó por cascada durante el uninstall del approach fallido). Click en
«Soluciones sectoriales» despliega los 4 hijos: Industrial, Distribución,
Servicios, Academias. La jerarquía está respetada en BD: hijos con
`parent_id=57` (Soluciones), no aplanados al `top_menu`.

Diferencia clave vs el screenshot fallido del round anterior
(`menu-1280.png` revertido): el dropdown es real (Bootstrap caret ▼ visible),
los 4 hijos NO aparecen aplanados en la barra horizontal, no hay duplicados
de Industrial/Distribución/etc.

- **URL:** `http://localhost:14070/`
- **Viewport:** 1280×800 px
- **Module commit:** Task 1.1 C.1 HEAD (commit del [FEAT] post_init_hook, ver `git log`)
- **Date:** 2026-04-28

---

## header-1280.png

**What it represents:** Home page del local Odoo 14 tras **Task 1.2 (header
desktop con botón Acceso clientes y selector ES|EU)**. Muestra el header con
el layout `[Logo] [Menú con Soluciones▾] [Español▾] [Acceso clientes]`:

- Botón «Acceso clientes» (clase `s_avanzosc_acceso_clientes`) en verde a la
  derecha, href `/web/login` (provisional, bloqueo blando [?] #2 spec).
- Selector de idioma «Español» con dropdown texto-solo (sin banderas),
  activado vía `website.header_language_selector active=True` y
  `website.header_language_selector_flag active=False`.
- Sign in y User dropdown del navbar eliminados por xpath sobre
  `website.template_header_default`.
- Menu items visibles: Inicio, Shop, Soluciones sectoriales (▾), Tienda,
  Blog, Formación. (Shop, Blog y los defaults de Odoo siguen en menú hasta
  que se configuren en tareas posteriores.)

- **URL:** `http://localhost:14070/`
- **Viewport:** 1280×800 px
- **Module commit:** Task 1.2 HEAD (ver `git log`)
- **Date:** 2026-04-28

---

## header-1280-post-defaults-cleanup.png

**What it represents:** Home page del local Odoo 14 tras la **mini-tarea
operacional de cleanup de menús default Odoo (D8.A.2)**. Comparado con
`header-1280.png`, ya NO aparecen Shop ni Blog en el navbar de website 1.
El navbar muestra exclusivamente nuestros 7 top-level: Inicio,
Soluciones sectoriales (▾), Tienda, Formación, Conócenos + 2 ítems
(Trabaja con nosotros, Contacto) que colapsan en `o_extra_menu_items`
(comportamiento Bootstrap responsive a 1280px, pre-existente, no causado
por la cleanup).

Implementación: `hooks.post_init_remove_odoo_defaults` crea un dummy
bajo Default Main Menu con la URL a eliminar (/shop, /blog, /slides,
/contactus) y lo `unlink()`. Odoo dispara cascade-by-URL definida en
`addons/website/models/website_menu.py:105-113`, que elimina todas las
copias per-website con esa URL pero PRESERVA los originales en Default
Main Menu (que tienen `website_id = NULL` y los xml_ids de core
website_sale, website_blog, website_slides, website). Ver CLAUDE.md
§11 D8 para el detalle del mecanismo.

- **URL:** `http://localhost:14070/`
- **Viewport:** 1280×800 px
- **Module commit:** post-Task-1.2 cleanup HEAD (ver `git log`)
- **Date:** 2026-04-28

---

## header-1280-public-1280.png

**What it represents:** Misma vista que `header-1280-post-defaults-cleanup.png`
pero en **sesión pública (sin login admin)** — no aparece la barra de admin
chrome del editor de Odoo arriba. Es el screenshot relevante para validar
cómo lo ve el visitante real del sitio.

**Conteo de items en navbar a 1280px (sesión pública):**

- **Visibles (5):** Inicio · Soluciones sectoriales (▾) · Tienda · Formación · Conócenos.
- **En overflow `o_extra_menu_items` (▼ "+", 2):** Trabaja con nosotros · Contacto.
- **Otros del header:** carrito (`o_wsale_my_cart`, icono solo) · selector de idioma «Español ▾» · botón `Acceso clientes`.

**Probe de viewport — ¿en qué ancho mínimo entran los 7?**

Probado en sesión pública, recargando la página tras cada resize (el handler
`o_extra_menu_items` solo recalcula en load). Resultado: **los 2 ítems
permanecen en overflow en TODOS los anchos probados (1280, 1366, 1440,
1520, 1600, 1760, 1920, 2560).**

Causa raíz medida: el wrapper Bootstrap `.container` está **capeado a 1140px**
incluso con viewport 2560px (no hay breakpoint xxl en Bootstrap 4 — Odoo 14
ships Bootstrap 4.6, no 5). Dentro de ese contenedor, `navbar-collapse`
recibe ~695px reales para los 7 ítems + caret del dropdown (los demás
flex-siblings del header — logo, lang, CTA — consumen el resto). 695px no
basta para los 7, así que el handler push-ea los últimos 2 al overflow
sistemáticamente, viewport-agnostic.

**Implicación de decisión:** el conteo no mejora subiendo el viewport.
Para que entren los 7 sin overflow se necesitaría intervención SCSS:
ampliar el wrapper a `container-fluid` (o `container-lg`/breakpoint
custom), reducir paddings/font-size del nav, o acortar labels (p. ej.
«Trabaja» en vez de «Trabaja con nosotros»). NO se ha aplicado ningún
cambio SCSS en este snapshot — queda como input para decisión del usuario:

  - **(A)** Aceptar overflow [+] permanente como diseño responsive válido.
  - **(B)** Forzar los 7 visibles ≥992px ajustando container/padding/labels.

- **URL:** `http://localhost:14070/`
- **Viewport:** 1280×800 px
- **Sesión:** pública (sin login)
- **Module commit:** post-Task-1.2 cleanup HEAD (ver `git log`)
- **Date:** 2026-04-28

---

## header-1280-final-v2.png

**What it represents:** Header tras la intervención de **rename + reorden +
container max-width 1320px** (sesión 2026-04-28). Estado canónico de cierre
del round de header desktop. Sesión pública, sin admin chrome.

**Cambios respecto a `header-1280-public-1280.png`:**

- **Renombre:** «Soluciones sectoriales» → **Soluciones**; «Trabaja con
  nosotros» → **Empleo**. Slugs `/trabaja-con-nosotros` y `#` no cambian
  (etiqueta visible y URL son decisiones independientes).
- **Reorden por funnel B2B:** Contacto sube a posición 5 (era 7);
  Conócenos pasa a 6 (era 5); Empleo se queda 7 (era 6). Razón: los 5
  primeros son los high-conversion items; Conócenos/Empleo son secundarios.
- **SCSS:** `header nav.navbar > .container { max-width: 1320px; width: 100% }`
  (sweet spot xxl de Bootstrap 5, ya que Odoo 14 ships Bootstrap 4.6 sin
  ese breakpoint).

**Conteo a 1280px (público):** 7 top-level visibles, 0 en overflow.

`Inicio · Soluciones (▾) · Tienda · Formación · Contacto · Conócenos · Empleo`
+ carrito · «Español ▾» · botón `Acceso clientes`. El elemento
`o_extra_menu_items` ni siquiera se inyecta en el DOM.

- **URL:** `http://localhost:14070/`
- **Viewport:** 1280×800 px
- **Sesión:** pública (sin login)
- **Module commit:** post-rename HEAD (ver `git log`)
- **Date:** 2026-04-28

---

## header-992-final-v2.png

**What it represents:** Mismo build que `header-1280-final-v2.png` capturado
a viewport 992 (último ancho desktop antes del switch a hamburger). Confirma
el comportamiento responsive aceptado en la decisión **(A)** del round.

**Conteo a 992px (público):** 4 visibles + 3 en overflow `[+]`.

- **Visibles (4):** Inicio · Soluciones (▾) · Tienda · Formación.
- **En overflow `[+]` (3):** Contacto · Conócenos · Empleo.

Nota: la expectativa inicial era 5+2 (Contacto visible, Conócenos+Empleo
en overflow). El conteo real es 4+3 porque Contacto tampoco encaja en el
`navbar-collapse` que a 992px mide ~515px tras descontar logo (150) +
lang (77) + CTA (156) + paddings del flex `.container` (960). Aceptado
como no bloqueante per decisión **(A)**: comportamiento estándar moderno
del navbar responsive (todos al hamburger en mobile, descomposición
gradual en desktop estrecho).

- **URL:** `http://localhost:14070/`
- **Viewport:** 992×800 px
- **Sesión:** pública (sin login)
- **Module commit:** post-rename HEAD (ver `git log`)
- **Date:** 2026-04-28

---

## header-991-hamburger.png

**What it represents:** Snapshot de evidencia del **switchover a hamburger
en el breakpoint lg** (Bootstrap `navbar-expand-lg` → 992px). A 991 (1px
por debajo del breakpoint) el botón `.navbar-toggler` (☰) se hace visible
y `.navbar-collapse` colapsa con `display: none` por defecto (espera al
toggle del usuario para abrir).

Visible en el screenshot: Logo · ☰ · «Español ▾» · botón `Acceso clientes`.
Los 7 menu items NO se renderizan visualmente — están en el DOM dentro de
`.navbar-collapse` colapsada y aparecen al toggle.

**Limitación**: la apariencia del menú abierto en hamburger NO está
estilizada según spec — esa estilización es scope de **Task 7.x** (mobile).
Esta captura sirve solo como evidencia de que el switchover de breakpoint
funciona correctamente con la herencia actual del header. La UX completa
mobile (animaciones de apertura, full-screen overlay, etc.) viene después.

- **URL:** `http://localhost:14070/`
- **Viewport:** 991×800 px
- **Sesión:** pública (sin login)
- **Module commit:** post-rename HEAD (ver `git log`)
- **Date:** 2026-04-28

---

## header-sticky-top.png

**What it represents:** Estado **inicial** del header sticky (Task 1.3) con
`scroll = 0`. Sesión pública. El header está en su tamaño/aspecto original:
`padding: 1rem` arriba/abajo, sin `box-shadow`. La clase `is-scrolled` NO
está aplicada al `<header>`.

**Notas técnicas del setup:**

- `position: sticky; top: 0; z-index: 1020` aplicado al `<header>` vía
  `_header.scss`. Sticky CSS-only: no necesita JS para mantenerse arriba.
- Wrapper Odoo: el contenido se scrollea dentro de `#wrapwrap` (no window)
  porque `html, body` tienen `overflow: hidden`. Lenis fue reconfigurado
  para targetear `#wrapwrap` (Task 0.6 fix retroactivo).
- Página de prueba: la home placeholder de Odoo es ~800px (un viewport
  exacto), insuficiente para scroll real. Para esta verificación se inyectó
  un spacer de 2000px en `<main>` vía Playwright eval; no es contenido
  productivo, solo evidencia de comportamiento sticky/scrolled.

- **URL:** `http://localhost:14070/`
- **Viewport:** 1280×800 px
- **Sesión:** pública (sin login)
- **Module commit:** task 1.3 HEAD (ver `git log`)
- **Date:** 2026-04-28

---

## header-sticky-scrolled.png

**What it represents:** Estado **scrolled** del header sticky (Task 1.3)
con `scroll = 200`. Sesión pública, mismo viewport y misma página de prueba
que `header-sticky-top.png`.

**Cambios visuales aplicados** (medidos en computed style tras la
transición de 250ms):

- `padding-top` y `padding-bottom`: `0.5rem` (= 8px). Era `1rem` (= 16px).
- `box-shadow`: `0 2px 8px rgba(0, 0, 0, 0.08)`. Era `none`.
- Tipografía y logo SIN cambios (per briefing Task 1.3 — solo padding y
  sombra; cambiar font-size en scroll suele verse «cutre»).
- Clase `is-scrolled` añadida al `<header>` por main.js.

**Listener empleado** (rama según `prefers-reduced-motion`):

- Caso normal (animaciones ON, Lenis instanciado): `lenis.on('scroll', cb)`.
  El callback recibe la instancia y lee `lenis.scroll`. El throttle es
  implícito — Lenis emite el evento al ritmo de su rAF interno.
- Caso reduced-motion (Lenis no se inicializa): `wrapwrap.addEventListener
  ('scroll', cb, {passive: true})` con throttle rAF (1 frame ≈ 16ms).
  Lee `wrapwrap.scrollTop`. Verificado funcionando vía
  `page.emulateMedia({ reducedMotion: 'reduce' })`.

**Transición**: `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out expo per
CLAUDE.md §5), 250ms. Bajo `prefers-reduced-motion: reduce`, la transición
se neutraliza vía `@include reduced-motion { transition: none }` →
cambio de estado instantáneo, sticky sigue funcionando.

- **URL:** `http://localhost:14070/`
- **Viewport:** 1280×800 px
- **Sesión:** pública (sin login)
- **Scroll position:** 200 px (vía `lenis.scrollTo(200, { immediate: true })`)
- **Module commit:** task 1.3 HEAD (ver `git log`)
- **Date:** 2026-04-28
