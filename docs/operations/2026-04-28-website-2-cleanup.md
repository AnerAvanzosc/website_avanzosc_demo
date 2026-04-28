# Cleanup operacional — Website 2 + huérfanos de Task 1.1 fallida

Fecha: 2026-04-28
Operación sobre BD `odoo14_community` (no afecta producción).

## Contexto

Durante el cierre de Task 1.1 se descubrió un bug arquitectural en el módulo
`website` core de Odoo 14: el método `Menu.create()` aplana `parent_id` al
`top_menu` del website cuando crea copias para cada website, ignorando la
jerarquía declarada en XML. Detalles en CLAUDE.md §11 D7 y commit
`[REVERT] task 1.1 (c08f3ba)`.

Este cleanup deja la BD lista para el replanteo de Task 1.1 con
`post_init_hook` (commit `[FEAT] task 1.1 (C.1)`).

## Acciones ejecutadas (orden)

### 1. Eliminación del Website 2 («My Website 2»)

Website creado por demo data de Odoo (`addons/website/data/website_demo.xml:385`,
`noupdate=true` — no se recrea en `-u`). Vacío de contenido específico:
0 productos, 0 slides, 0 attachments propios, sin domain configurado.
Estaba duplicando los menús y multiplicando el problema de la jerarquía
aplanada.

Pre-eliminación:
- Backup completo: `/tmp/backup-pre-website-cleanup-20260427-155324.sql` (13 MB).
- Verificación `ir_model_data`: 1 fila `module='website' name='website2'`,
  `noupdate=true` — confirmada como demo data, no producción activa.
- Verificación `website_rewrite` con website_id=2: 0 filas.
- Verificación `ir_config_parameter`: sin entradas relevantes.

Eliminación vía Odoo shell (no SQL crudo):

```
website2 = env['website'].browse(2)
website2.unlink()
env.cr.commit()
```

Output del ORM:
```
deleted ir.model.data records with IDs: [16027]
deleted ir.attachment records with IDs: [454, 455]
deleted website records with IDs: [2]
```

CASCADE constraints gestionados por Odoo: 17 `website_menu` records de
website 2 + 1 `website_page` (Home) + 1 `website_lang_rel` (English default)
fueron eliminados automáticamente.

### 2. Eliminación de huérfanos de Task 1.1 fallida en Website 1

Tras eliminar website 2, website 1 todavía contenía residuos del approach
XML data fallido: 11 records SIN xml_id (huérfanos puros) + 4 records con
xml_id apuntando incorrectamente a copias aplanadas en website 1 (parent
al top_menu, no al Soluciones intermedio).

15 records eliminados en website 1 (todos con `parent_id=4` = top_menu):

| ID | Name | xml_id |
|---|---|---|
| 22 | Inicio | (huérfano) |
| 25 | Soluciones sectoriales | (huérfano) |
| 28 | Industrial | (huérfano) |
| 30 | Distribución | (huérfano) |
| 32 | Servicios | (huérfano) |
| 34 | Academias | (huérfano) |
| 36 | Tienda | (huérfano) |
| 39 | Formación | (huérfano) |
| 42 | Conócenos | (huérfano) |
| 45 | Trabaja con nosotros | (huérfano) |
| 48 | Contacto | (huérfano) |
| 51 | Industrial | `website_avanzosc_demo.menu_industrial` |
| 52 | Distribución | `website_avanzosc_demo.menu_distribucion` |
| 53 | Servicios | `website_avanzosc_demo.menu_servicios` |
| 54 | Academias | `website_avanzosc_demo.menu_academias` |

Y 4 entradas de `ir_model_data` (las de los 4 hijos del dropdown que en
el replanteo se gestionan vía `post_init_hook`, ya no como XML data).

Eliminación vía Odoo shell.

### 3. Defaults Odoo en Website 1 NO tocados

Por instrucción del usuario, los 5 menús default de Odoo en website 1
(Home id=5, Shop id=16, Blog id=10, Courses id=19, Contact us id=6)
quedan presentes. Su cleanup es scope de tarea futura separada (Task 1.x
diferida).

## Estado post-cleanup

| Tabla / Filtro | Count |
|---|---|
| `website` total | 1 (id=1, «My Website») |
| `website_menu` con website_id=1 | 6 (raíz id=4 + 5 defaults Odoo) |
| `website_menu` con website_id=NULL (Default Main Menu) | 13 (intacto) |
| `ir_model_data` module='website_avanzosc_demo' model='website.menu' | 7 (los top-level) |

Smoke verde tras el cleanup: `docs/smoke-tests/website-cleanup.log`.

## Diferido

Cleanup de los 5 menús default Odoo en website 1 (Home, Shop, Blog,
Courses, Contact us) — pendiente como tarea separada, post Task 1.1.
Approach técnico (override noupdate, hook adicional, o XML data
declarativo) se decide al planificar la tarea.
