# Q3 Legal Validation — `docs/q3-legal-validation/`

Carpeta dedicada al gate Q3 (revisión legal de las 3 páginas legales por
asesoría externa de Avanzosc). El gate Q3 es bloqueante para el switchover
a producción (per CLAUDE.md §11 y switchover-runbook).

## Flujo en 2 fases

**Fase 1 — Pre-revisión del dev** (esta carpeta, `dev-prereview-YYYY-MM-DD/`):
generamos PDFs renderizados de las 3 páginas + XLSX con las 23 strings
LEGAL DRAFT del .po + tabla de datos sensibles a verificar. El dev (Aner
o el orquestador humano) detecta problemas obvios (datos incorrectos,
typos, coherencia, links rotos) que se pueden arreglar sin competencia
legal. El objetivo es no mandar el paquete a la asesoría con basura
evidente que el dev podría haber filtrado antes.

**Fase 2 — Paquete a asesoría legal externa** (futuro, no en este commit):
una vez el dev cierra los issues detectados en Fase 1, generamos el
paquete formal para la asesoría (PDFs limpios + XLSX con preguntas
específicas + nota de contexto operativo). Esa entrega es la que dispara
la revisión legal real que cierra el gate Q3.

## Estructura

```
docs/q3-legal-validation/
├── README.md                                      (este archivo)
├── plausible-analytics-pending-additions.md       (D25 — Q4: cambios obligatorios para Fase 2)
└── dev-prereview-2026-04-30/
    ├── pdfs/
    │   ├── 01-aviso-legal-es.pdf
    │   ├── 02-politica-privacidad-es.pdf
    │   └── 03-politica-cookies-es.pdf
    ├── tools/
    │   └── gen_q3_prereview_xlsx.py              (script generador)
    ├── avanzosc-q3-legal-prereview-2026-04-30.xlsx  (entregable XLSX)
    └── datos-sensibles-extraidos.md              (tabla con checkboxes)
```

## Notas para Fase 2 (paquete a asesoría)

Antes de generar `for-legal-advisor-YYYY-MM-DD/`, leer y aplicar:

- `plausible-analytics-pending-additions.md` — D25 (sesión 2026-05-04)
  registra que aviso legal + política de privacidad deben mencionar
  Plausible Analytics, ausencia de cookies de tracking y link a la
  política de Plausible. La asesoría tiene la última palabra sobre el
  wording exacto y sobre decisiones legales (interés legítimo vs
  consent, DPA explícito).

## Entregable actual (Fase 1)

**Fecha**: 2026-04-30
**Audiencia**: dev interno (Aner / orquestador), NO asesoría legal externa.

| Archivo | Propósito |
|---|---|
| `pdfs/01-aviso-legal-es.pdf` | Render desktop ES de `/aviso-legal` (Chrome headless) |
| `pdfs/02-politica-privacidad-es.pdf` | Render desktop ES de `/politica-privacidad` |
| `pdfs/03-politica-cookies-es.pdf` | Render desktop ES de `/politica-cookies` |
| `avanzosc-q3-legal-prereview-2026-04-30.xlsx` | XLSX con las 23 strings LEGAL DRAFT en formato pre-revisión: ID + ES + Notas dev + Contexto |
| `datos-sensibles-extraidos.md` | Tabla con todos los datos sensibles encontrados (CIF, dirección, etc.) + lista de candidatos a fixear sin asesoría + lista de decisiones que solo la asesoría puede tomar |

## Próximos pasos

1. **Dev pre-revisión** (próxima sesión humana): abrir XLSX, leer PDFs,
   marcar checkboxes en `datos-sensibles-extraidos.md`, anotar issues
   en columna «Notas dev» del XLSX.
2. **Fixes de templates** (sesión dev posterior): aplicar los issues
   detectados en Fase 1 a los templates QWeb. Commit `[FIX] q3:
   pre-asesoría legal fixes from dev review`.
3. **Generación paquete Fase 2** (próxima carpeta `for-legal-advisor-YYYY-MM-DD/`):
   PDFs limpios + XLSX con preguntas específicas + nota contexto.
4. **Envío a asesoría externa**: trigger de Q3 humano.
5. **Ronda de revisión asesoría**: la asesoría devuelve correcciones.
6. **Aplicación correcciones** + cierre Q3 (levantar markers
   `LEGAL DRAFT - REVIEW NEEDED` del .po para las 23 entries).
7. **Switchover desbloqueado** (también pendiente Q1).

## Relación con Q1

Las 23 strings LEGAL DRAFT también aparecen en el XLSX Q1
(`docs/q1-eu-validation/avanzosc-eu-validation-2026-04-30.xlsx`,
pestaña «Legal — ESPERAR Q3») pero allí están bloqueadas con banner
rojo «NO editar todavía». La revisión lingüística EU se aplazará hasta
que Q3 cierre los textos ES base. La pre-revisión Q3 (esta carpeta) es
sobre el SOURCE ES exclusivamente.

## Convenciones

- Carpeta por entregable: `<fase>-<audiencia>-<fecha>/`. Ej:
  `dev-prereview-2026-04-30/`, `for-legal-advisor-2026-MM-DD/`,
  `legal-feedback-2026-MM-DD/` (si la asesoría devuelve algo).
- PDFs: `<NN>-<slug-con-idioma>.pdf` (ej: `01-aviso-legal-es.pdf`,
  posible futuro `01-aviso-legal-eu.pdf`).
- XLSX: `avanzosc-q3-<fase>-<fecha>.xlsx`.
- Histórico: NO borrar entregables previos. Cada ronda añade carpeta nueva.
