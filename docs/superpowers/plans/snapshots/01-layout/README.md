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
