# Q1 EU Validation Package — `docs/q1-eu-validation/`

Carpeta dedicada a los entregables del gate Q1 (revisión lingüística EU
por el equipo de Avanzosc). Cada entrega genera un XLSX + PNGs de
preview + (al volver del revisor) la versión `-RETURNED.xlsx` con
correcciones.

## Estructura

```
docs/q1-eu-validation/
├── README.md                                          (este archivo)
├── avanzosc-eu-validation-2026-04-30.xlsx             (entregable canónico)
├── screenshots/
│   └── 2026-04-30/                                    (preview por pestaña)
│       ├── 00-instrucciones.png
│       ├── 01-legal-esperar-q3.png
│       ├── 02-contacto.png
│       ├── 03-conócenos-equipo-empleo.png
│       ├── 04-soluciones-4-sectoriales.png
│       ├── 05-transversales.png
│       ├── 06-hero-home.png
│       └── 07-navegación-footer.png
└── tools/
    └── gen_q1_xlsx.py                                 (script generador)
```

## Propósito

El módulo `website_avanzosc_demo` se entrega bilingüe ES + EU, pero las
traducciones EU iniciales fueron generadas como borradores automáticos
(marcadas DRAFT en `i18n/eu.po`). Antes de publicar la web en producción,
el equipo lingüístico de Avanzosc revisa cada string y corrige las que
necesiten ajuste.

Para que la revisión sea posible sin tooling técnico, el dev empaqueta
las strings DRAFT en un XLSX con una pestaña por bloque temático y
columnas dedicadas para que el revisor escriba correcciones y notas.

Detalle del procedimiento (qué hace el revisor, qué hace el dev al
mergear las correcciones de vuelta a `i18n/eu.po`): ver
[`docs/q1-validation-runbook.md`](../q1-validation-runbook.md) §5 y §5.2.

## Último entregable

**Fecha**: 2026-04-30
**Archivo**: `avanzosc-eu-validation-2026-04-30.xlsx` · 8 pestañas (INSTRUCCIONES + 7 bloques)
**Preview PNGs**: [`screenshots/2026-04-30/`](screenshots/2026-04-30/) · 8 imágenes · 100 dpi A3 landscape · ~1.6 MB total · **v3 post-eliminación /trabaja-con-nosotros** (ver historial abajo)
**Strings totales**: 180 (157 Q1 + 23 Q3)
**Bloques**: ver tabla en runbook §5 — Entrega 2026-04-30.

### Historial de versiones

| Versión | Fecha | Commit | Cambio |
|---|---|---|---|
| v3 | 2026-04-30 | (este commit) | Página /trabaja-con-nosotros eliminada del sitio: 21 strings retiradas del .po (20 exclusivas + 1 «Empleo» que pierde sus 2 referentes — menu_trabaja borrado, footer link borrado). Total: 201 → 180. Pestaña B4 renombrada de «Conócenos / Equipo / Empleo» a «Conócenos / Equipo» (47 → 27 strings). Pestaña B2 «Navegación & Footer» también baja: 12 → 11 strings. URL antigua `/trabaja-con-nosotros` redirige 301 a `/conocenos`. |
| v2 | 2026-04-30 | `d20a33a` | Row heights calculadas para evitar text overlap visible en filas con strings largas (>50 chars en columnas ES/EU/Contexto). XLSX y PNGs regenerados. IDs Q1-XXXXXX estables. |
| v1 | 2026-04-30 | `37870e7` | Versión inicial. Row heights = None (default openpyxl) → wrapText desbordaba detrás de la fila siguiente. PNGs entregadas en `350a4f0` documentaban el problema. |

## Script generador

[`tools/gen_q1_xlsx.py`](tools/gen_q1_xlsx.py) — autocontenido,
re-ejecutable. Docstring del fichero documenta requisitos, asunciones
sobre el `.po`, salida esperada y cómo regenerar.

Requisitos: `polib` (en venv Odoo) + `openpyxl 3.1+` (instalación manual,
ver runbook §5.1).

## Convenciones de naming

- XLSX entregable: `avanzosc-eu-validation-YYYY-MM-DD.xlsx`.
- XLSX devuelto por el revisor: `avanzosc-eu-validation-YYYY-MM-DD-RETURNED.xlsx`.
- Screenshots: `screenshots/YYYY-MM-DD/<NN>-<slug-sheet-name>.png`.
- Si hay múltiples rondas de revisión sobre un mismo paquete: sufijo
  `-r2`, `-r3`, etc. en el nombre.

## Notas

- Los XLSX históricos (de entregas previas cerradas) se mantienen en
  esta carpeta como evidencia del proceso. No borrar.
- Las screenshots son **preview**, NO el entregable. El XLSX siempre es
  la fuente de verdad para el revisor.
- Si se regenera el XLSX (e.g. tras añadir nuevas strings DRAFT al .po),
  ajustar `OUT_PATH` dentro del script con la fecha del nuevo paquete y
  no sobrescribir el archivo previo.
