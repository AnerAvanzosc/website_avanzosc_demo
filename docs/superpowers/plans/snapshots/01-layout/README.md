# Layout snapshots — Phase 1

Inicial: 2026-04-27. Capturas tras los hitos de la fase 1 (layout base: menú,
header desktop, footer, sticky behaviour). Sirve de before/after reference para
las 7 tareas de Phase 1 (1.1–1.7) y para diff visual contra los baselines de
`00-baseline/`. Cada captura indica su tarea de origen y el commit del módulo
en ese punto. Mismo formato heading-per-entry que `00-baseline/README.md`
(formato canónico para todos los folders de snapshots).

---

## menu-1280.png

**What it represents:** Home page del local Odoo 14 tras **Task 1.1** (creación
de `data/menu.xml` con los 11 records: 7 items top-level más 4 hijos del
dropdown «Soluciones sectoriales»). El navbar muestra los 11 nuevos items
**alongside** los items default de Odoo (Home, Shop, Blog, Courses, Contact us)
— los duplicados son esperados per briefing y se limpian en una tarea posterior.
Sirve como baseline visible del problema de coexistencia con el menú default.

- **URL:** `http://localhost:14070/`
- **Viewport:** 1280×800 px
- **Module commit:** Task 1.1 HEAD (commit `c08f3ba` o posterior, ver `git log`)
- **Date:** 2026-04-27
