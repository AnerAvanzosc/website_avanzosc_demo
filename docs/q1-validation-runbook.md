# Q1 — Runbook de validación lingüística DRAFTs EU

**Estado**: gate Phase 9.5 abierto. Phase 9 cierra técnicamente como
"infraestructura completa, gate Q1 abierto". Switchover (Phase 10)
bloqueado hasta que este runbook se ejecute completo por el equipo
Avanzosc.

**Fecha de creación**: 2026-04-29 (Phase 9.5).

---

## 1. Resumen ejecutivo

El módulo `website_avanzosc_demo` entrega su versión v1 con bilingüe
ES + EU completamente funcional. Los strings ES son la fuente
canónica; los strings EU viven en `i18n/eu.po` y se aplican
automáticamente cuando `request.lang.code == 'eu_ES'`.

**Contadores actuales** (sesión 2026-04-29 cierre Phase 9.5):

| Métrica | Valor |
|---|---|
| Total `msgid` en `i18n/eu.po` | **192** |
| Strings **VALIDADAS** (sin flag fuzzy, sin marker DRAFT) | **10** |
| Strings **DRAFT** (flag `#, fuzzy` + comentario `DRAFT - REVIEW NEEDED`) | **182** |
| De ellas: marcadas `LEGAL DRAFT` (revisión por asesoría legal Q3) | **23** |
| De ellas: marcadas `DRAFT` general (Q1 revisión lingüística Avanzosc) | **159** |

Las 10 validadas (D2, sesión brainstorm 2026-04-27):
- Claim corporativo (1): «Odoo industrial de verdad, desde 2008.» → «Benetako Odoo industriala, 2008tik.».
- 4 slugs URL sectoriales: industrial→industriala, distribucion→banaketa, servicios→zerbitzuak, academias→akademiak.
- 5 strings auxiliares fijas en metadata sin necesidad de fuzzy.

---

## 2. Tabla agrupada por criticidad

Conteo aproximado por categoría (revisar el .po para conteos exactos al
revisar cada bloque). Suma los grupos por debajo:

### 2.1 — Crítico — UI principal (~37 strings)

Strings que aparecen en la primera pantalla de cada página o en la
navegación. **Ver primero** porque cualquier error es visible
inmediatamente.

- Menú principal (top-level + dropdown sectoriales): 7 items.
- Hero claims y subtítulos de las 4 sectoriales: 8.
- Hero claims y subtítulos de Conócenos, Empleo, Contacto: 6.
- CTA texts (Hero CTAs primary/secondary, CTA Kit Consulting, CTA
  Contacto): ~10.
- Footer headings (Soluciones, Empresa, Legal): 3.
- Sectores grid 1-line por sector: 4.

### 2.2 — Alto — Copy de páginas (~80 strings)

Cuerpo principal de las páginas corporativas y sectoriales.

- Conócenos: misión + 4 valores + historia + bloque equipo (~12 strings).
- Empleo: por qué + 5 perfiles + vacantes (~14 strings).
- Contacto: cómo encontrarnos + 3 datos + mapa attribution (~6 strings).
- Sector specifics × 4 sectoriales (título + intro + 6 items): 32.
- Pilares 1-lines (3): 3.
- Timeline 8 hitos × 2 strings (año + descripción): 16.
- Equipo párrafo + 4 stats: ~5.
- CTA Kit Consulting subtítulo: ~3.

### 2.3 — Medio — Caso éxito archetype 1 (9 strings)

Solo el archetype activo (default config_parameter `1`). Los archetypes
2-8 quedan SIN traducir hasta cierre de [?] #7 spec (selección final).

### 2.4 — Bajo — ARIA labels, metadata, microcopy (~10 strings)

- Aria-labels de hamburger / close / user icon (`<span class="sr-only">`).
- Microcopy de mapa OSM, switcher activo, etc.
- Datos legales fijos no traducibles (CIF, dirección, nombre razón social).

### 2.5 — LEGAL DRAFT — separado (Q3 gate, 23 strings)

Marcadas con comentario `# LEGAL DRAFT - REVIEW NEEDED` en eu.po. Son
los **titulares de sección + subtítulos** de las 3 páginas legales:
- Aviso Legal: H1 subtítulo + 7 H2 sección.
- Política de Privacidad: H1 subtítulo + 8 H2 sección.
- Política de Cookies: H1 subtítulo + 5 H2 sección.

**Cuerpo de las legales NO está en eu.po** — sigue en ES literal. La
traducción EU completa de los textos legales quedará para Phase 9
extension cuando la asesoría legal valide los textos ES base. Doble
gate: Q3 (asesoría legal de Avanzosc revisa textos ES) + Q1 (revisión
lingüística EU).

---

## 3. Procedimiento de revisión

### 3.1 — Abrir el archivo

```
i18n/eu.po
```

Editor recomendado: cualquier editor de texto plano (VSCode, vim, nano,
Sublime). NO usar editor binario como POEdit a menos que se familiarice
con el formato — los comentarios extra `# DRAFT - REVIEW NEEDED` son
manuales y POEdit puede borrarlos.

### 3.2 — Identificar cada string a revisar

Buscar `# DRAFT` (mayúsculas) en el editor. Cada match marca un bloque
de 4-7 líneas:

```po
# DRAFT - REVIEW NEEDED — <breve descripción del contexto>
#. module: website_avanzosc_demo
#: <referencia a view/menu/page>
#, fuzzy
msgid "<original ES>"
msgstr "<traducción EU borrador>"
```

### 3.3 — Levantar la validación de un string

Cuando una traducción esté validada lingüísticamente:

1. Eliminar la línea `# DRAFT - REVIEW NEEDED — ...` (o cambiar a `# VALIDATED — ...`).
2. Eliminar la línea `#, fuzzy`.

Resultado:

```po
#. module: website_avanzosc_demo
#: <referencia>
msgid "<original ES>"
msgstr "<traducción EU validada>"
```

Las líneas con `#.` (extracted-comments) y `#:` (references) son
metadatos de Odoo y NO se tocan.

### 3.4 — Si la traducción debe corregirse

Cambiar el `msgstr` por la versión correcta. **MANTENER** el flag fuzzy
y el marker DRAFT hasta que la corrección sea validada:

```po
# DRAFT - REVIEW NEEDED — <descripción> (corregido 2026-XX-XX)
...
#, fuzzy
msgid "<original ES>"
msgstr "<NUEVA traducción EU>"
```

Cuando un segundo revisor confirme la corrección, levantar flags
(paso 3.3).

### 3.5 — Testear visualmente la traducción

Acceder a la URL EU correspondiente. Mapeo:

| Página | URL EU |
|---|---|
| Home | `http://localhost:14070/eu_ES/` |
| Industrial | `http://localhost:14070/eu_ES/industrial` |
| Distribución | `http://localhost:14070/eu_ES/distribucion` |
| Servicios | `http://localhost:14070/eu_ES/servicios` |
| Academias | `http://localhost:14070/eu_ES/academias` |
| Conócenos | `http://localhost:14070/eu_ES/conocenos` |
| Empleo | `http://localhost:14070/eu_ES/trabaja-con-nosotros` |
| Contacto | `http://localhost:14070/eu_ES/contacto` |
| Aviso Legal | `http://localhost:14070/eu_ES/aviso-legal` |
| Privacidad | `http://localhost:14070/eu_ES/politica-privacidad` |
| Cookies | `http://localhost:14070/eu_ES/politica-cookies` |
| Kit Consulting | (D5 ES-only, no EU) |

Comparar visualmente la traducción contra la original ES (sin prefijo
`/eu_ES/`).

---

## 4. Procedimiento post-revisión completa

### 4.1 — Re-instalar/actualizar el módulo

```bash
./scripts/run-smoke.sh phase9-q1-validation
```

(Equivale a `-u website_avanzosc_demo --stop-after-init` con captura
del log per CLAUDE.md §12 regla #5.)

### 4.2 — Verificar smoke verde

`SMOKE OK` en stdout. Log en `docs/smoke-tests/phase9-q1-validation.log`.

### 4.3 — Re-grep TRANSLATION DRAFT en data/views/static

```bash
grep -rn "TRANSLATION DRAFT" data/ views/ static/
```

Debe devolver **0** matches relevantes. Si quedan: revisar cada uno y
levantar el flag o convertir el comentario a `# VALIDATED — ...`.

NOTA: el grep del plan §9.5 busca «TRANSLATION DRAFT» en data/views/static.
Las 182 strings DRAFT viven en `i18n/eu.po` y se cuentan diferente —
ver paso 4.4.

### 4.4 — Conteo final DRAFT en eu.po

```bash
grep -c "# DRAFT - REVIEW NEEDED" i18n/eu.po
grep -c "# LEGAL DRAFT - REVIEW NEEDED" i18n/eu.po
grep -c "^#, fuzzy" i18n/eu.po
```

Para cierre Q1 puro (sin Q3 legal): el primer comando debe ser **0**.
Para cierre Q1 + Q3 conjunto: los tres comandos deben ser **0**.

### 4.5 — Phase 9.5 cierra

Cuando 4.3 + 4.4 estén en 0, actualizar:

- `docs/superpowers/plans/2026-04-27-website-avanzosc-demo-v1-plan.md` §9.5: marcar como `OK`.
- `CLAUDE.md` §11 entrada Q1: marcar como cerrada.
- `i18n/eu.po` cabecera bloque «Q1 GATE»: actualizar contadores y nota
  de gate cerrado.

**Switchover (Phase 10) desbloqueado** una vez Q1 + Q3 cerrados.

---

## 5. Entregas al equipo lingüístico de Avanzosc

### Entrega 2026-04-30 — Paquete XLSX inicial

**Generado por**: dev session post-cierre bloque post-v1.
**Ruta**: `docs/q1-eu-validation/avanzosc-eu-validation-2026-04-30.xlsx`.
**Generador**: `/tmp/gen_q1_xlsx.py` (script ad-hoc parseando `i18n/eu.po` con polib + openpyxl). Output reproducible — re-ejecutable si la baseline cambia.

**Conteo final por bloque** (201 strings totales pendientes Q1+Q3):

| Pestaña XLSX | Bloque ID | Strings |
|---|---|---|
| Hero & Home | B1_HERO_HOME | 34 |
| Navegación & Footer | B2_NAV_FOOTER | 12 |
| Soluciones (4 sectoriales) | B3_SOLUCIONES | 51 |
| Conócenos - Equipo - Empleo | B4_CONOCENOS | 47 |
| Contacto | B5_CONTACTO | 32 |
| Transversales | B6_TRANSVERSALES | 2 |
| Legal — ESPERAR Q3 | B7_LEGAL | 23 |
| **Total** | | **201** |

**Distinción Q1 vs Q3**: 178 strings Q1 (revisión lingüística Avanzosc) + 23 strings Q3 (revisión asesoría legal). La pestaña Legal lleva un banner rojo «ESPERAR Q3 — bloque informativo, NO editar todavía» en la fila 3, antes del header de columnas.

**Estructura del XLSX**:
- Pestaña 0 — INSTRUCCIONES (readme para el revisor: qué es, qué hacer, glosario, tono, qué hacer con Legal, cómo devolver).
- Pestañas 1-7 — bloques temáticos. Columnas: ID (Q1-XXXXXX hash SHA1 del msgid, estable y re-mapeable), ES (source), EU DRAFT (current), EU FINAL (vacío, fondo amarillo, lo rellena el revisor), Notas (vacío, amarillo), Contexto (URL/snippet + descripción del comentario DRAFT).

**ID estable**: cada string tiene un identificador `Q1-{6-hex-uppercase}` derivado de `sha1(msgid).hexdigest()[:6].upper()`. Ventaja: independiente del orden del .po — si en futuro reordenamos o añadimos entries, los IDs existentes no cambian. El revisor escribe en EU FINAL/Notas; el dev al merge usa el ID para localizar la entry en el .po (via msgid o re-derivar hash).

### 5.1 — Procedimiento del dev al recibir el XLSX devuelto

Cuando el equipo de Avanzosc devuelva el XLSX con la columna EU FINAL rellena en las strings que necesiten cambios:

1. Guardar el archivo devuelto como `docs/q1-eu-validation/avanzosc-eu-validation-2026-04-30-RETURNED.xlsx` (sufijo `-RETURNED` para distinguir del original).

2. Parsear con polib + openpyxl: para cada fila con `EU FINAL` no-vacío, localizar la entry en `i18n/eu.po` por `msgid` (la columna ES de la fila), validar que `Q1-{hash}` coincide con `sha1(msgid)[:6].upper()`, sustituir `msgstr` por el valor de `EU FINAL`. Si `EU FINAL` está vacío, mantener `msgstr` actual (interpretación per pestaña INSTRUCCIONES: «vacío = aprobamos la draft»).

3. Levantar el flag DRAFT en cada entry actualizada o aprobada:
   - Eliminar la línea `# DRAFT - REVIEW NEEDED — ...` (no `# LEGAL DRAFT`, ese sigue hasta Q3).
   - Eliminar el flag `#, fuzzy`.
   - Si la entry mantiene `msgstr` original (aprobada draft directa), se levantan flags igual.

4. Las entries Q3 (LEGAL DRAFT) se mantienen intactas. El revisor del paquete Q1 NO debería haber tocado la pestaña «Legal — ESPERAR Q3»; si lo ha hecho por error, anotarlo y consultarle.

5. Smoke + verificación visual:
   ```bash
   ./scripts/run-smoke.sh q1-merge
   curl -s http://localhost:14070/ -H 'Cache-Control: no-cache' >/dev/null   # forzar regen del bundle (gotcha CLAUDE.md §7)
   ```
   Visitar `http://localhost:14070/eu_ES/` y las URLs EU listadas en §3.5 para verificar que las correcciones se renderizan correctamente.

6. Re-grep DRAFT: `grep -c "# DRAFT - REVIEW NEEDED" i18n/eu.po` debe ser 0 si Q1 está cerrado completo. Si quedan, son strings que el revisor dejó pendientes (con notas) y requieren round 2.

7. Commit `[FEAT] q1: merge EU validation pass <round> — <N> strings updated, DRAFT flags lifted` con el conteo de strings actualizadas + las que mantuvieron draft aprobada. Smoke log adjunto.

8. Si Q1 cierra (0 entries con `# DRAFT - REVIEW NEEDED`): seguir el procedimiento §4 de este runbook (Phase 9.5 cierra, switchover desbloqueado salvo Q3 legal).

---

## 6. Referencias

- Plan §9.5 — Phase 9 GATE switchover.
- CLAUDE.md §11 D9 — Estrategia i18n: ES como source en QWeb,
  traducciones EU vía `i18n/eu.po`, sin `.pot`.
- CLAUDE.md §11 entrada Q1 (lingüística) — esta tarea.
- spec §13 #1 — EU slugs no sectoriales (subset de Q1).

---

## 7. Notas operativas

- Las traducciones DRAFT son **funcionales** pero no validadas. Odoo
  aplica `msgstr` aunque flag `fuzzy` esté presente — la diferencia es
  solo señalamiento al maintainer humano.
- Las URLs EU funcionan hoy mismo (`/eu_ES/<slug>` → 200). El gate Q1
  no afecta funcionalidad — afecta confianza en la calidad lingüística
  del texto presentado.
- Los archetypes 2-8 del caso éxito (~63 strings adicionales) están
  pendientes per [?] #7 spec. Cuando se cierre #7 con la elección
  final, añadir solo el subset elegido al eu.po + revisión Q1 sobre
  ese subset.
