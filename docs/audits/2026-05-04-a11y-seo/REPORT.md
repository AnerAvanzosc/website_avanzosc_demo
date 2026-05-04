# Auditoría a11y/SEO — 2026-05-04

**Branch**: `feature/v1-implementation` · **HEAD**: `390efd8` (pre-audit) · **Servidor**: `localhost:14070` (Odoo 14 dev).

**Sprint A — diagnóstico puro**: este reporte enumera y prioriza hallazgos. **NO se aplica ningún fix** en este commit; Sprint B decidirá scope con el orquestador.

---

## 1. Alcance

### URLs auditadas (12 = 6 ES + 6 EU)

| # | ES | EU |
|---|----|----|
| 1 | `/` | `/eu_ES/` |
| 2 | `/industrial` | `/eu_ES/industrial` |
| 3 | `/distribucion` | `/eu_ES/distribucion` |
| 4 | `/servicios` | `/eu_ES/servicios` |
| 5 | `/contacto` | `/eu_ES/contacto` |
| 6 | `/kit-consulting` *(ES-only per D5)* | `/eu_ES/conocenos` *(sustituto)* |

**Asimetría intencional**: `/kit-consulting` no tiene equivalente EU (D5, programa estatal hispanohablante). En el set EU se sustituyó por `/conocenos` (la siguiente página corporativa más relevante). Las academias y el resto de páginas legales quedan fuera del foco B2B-leads de este Sprint.

### Herramientas

- **Lighthouse 12.8.2** (npx) — accessibility / SEO / best-practices / performance — mobile + desktop por URL → 24 corridas, 48 archivos en `lighthouse/`.
- **axe-core 4.x** vía `puppeteer-core` con Chrome del sistema (`/usr/bin/google-chrome`) — WCAG 2.0 + 2.1 A/AA + best-practice — 1 corrida por URL → 12 archivos en `axe-core/`.
- **SEO checks scripted** (Node 20 stdlib) — title / description / `<html lang>` / hreflang / canonical / OG / Twitter Card / heading hierarchy / img alt / forms — 12 archivos + 3 globales (`_robots.json`, `_sitemap.json`, `_title_uniqueness.json`) en `seo-checks/`.

---

## 2. Resumen ejecutivo

### 2.1. Scores Lighthouse — promedio por idioma × form-factor

| Grupo | A11y | SEO | Best Practices | Performance* |
|---|---|---|---|---|
| ES / mobile | 89 | **61** | 82 | 53 |
| ES / desktop | 83 | **61** | 81 | 80 |
| EU / mobile | 88 | **61** | 82 | 54 |
| EU / desktop | 83 | **61** | 81 | 78 |

\* Performance localhost no es representativa de producción real — [`deferred-ttfb-prod`](../../decisions-log.md#deferred-ttfb-prod). FCP/LCP móvil ~15-16 s (CPU throttling 4×), desktop ~5-6 s. Re-validar tras switchover Phase 10.6 con `https://avanzosc.es/`.

**Lectura**:
- **A11y 83-92**: por encima del umbral, pero con margen claro hasta 95+ que es el target razonable de un sitio sin formas accesibilidad-pesadas.
- **SEO 61** consistente en las 24 corridas → issue sistemático (NO específico de ninguna URL). Fix de 2 audits eleva el bloque entero.
- **Best Practices 81-82** consistente → 2 issues sistemáticos heredados del stack Odoo 14.

### 2.2. Conteo de issues por severidad

| Severidad | Issues distintos | Páginas afectadas (rango) | Origen |
|---|---|---|---|
| 🔴 Críticos | **4** | 12/12 (3 issues), 12/12 + intencional (1) | axe-core + Lighthouse + SEO check |
| 🟡 Importantes | **9** | 1/12 a 12/12 | mix |
| 🟢 Mejoras | **4** | 1/12 a 12/12 | mix |

Sin hallazgos catastróficos (score <60) fuera de Performance móvil.

### 2.3. Top 3 hallazgos

1. **🔴 `aria-required-parent` (60 nodos en 12/12 páginas)** — los `<a role="menuitem">` del navbar no están dentro de un `[role=menu]`. WCAG 4.1.2 fail. Posiblemente arrastrado del template heredado `website.template_header_default`.
2. **🔴 Meta description vacía en las 12 URLs** — explica el SEO 61/100. Google fabricará snippets aleatorios; pérdida directa de CTR en SERP.
3. **🔴 `robots.txt: Disallow: /`** — INTENCIONAL pre-switchover (Phase 10.2 + D6) pero hay que recordar el flip en Phase 10.5/10.6 — sin él, **producción bloqueada para indexación**.

---

## 3. Tabla de scores Lighthouse por URL

| URL | Form | A11y | SEO | BP | Perf |
|---|---|---|---|---|---|
| /| mobile | 88 | 61 | 82 | 52 |
| /| desktop | 83 | 61 | 81 | 77 |
| /industrial | mobile | 88 | 61 | 82 | 52 |
| /industrial | desktop | 83 | 61 | 81 | 77 |
| /distribucion | mobile | 88 | 61 | 82 | 48 |
| /distribucion | desktop | 83 | 61 | 81 | 76 |
| /servicios | mobile | 88 | 61 | 82 | 54 |
| /servicios | desktop | 83 | 61 | 81 | 77 |
| /contacto | mobile | 89 | 61 | 82 | 54 |
| /contacto | desktop | 85 | 61 | 81 | 78 |
| /kit-consulting | mobile | 92 | 61 | 82 | 55 |
| /kit-consulting | desktop | 80 | 61 | 81 | 92 |
| /eu_ES/ | mobile | 88 | 61 | 82 | 54 |
| /eu_ES/ | desktop | 83 | 61 | 81 | 78 |
| /eu_ES/industrial | mobile | 88 | 61 | 82 | 54 |
| /eu_ES/industrial | desktop | 83 | 61 | 81 | 78 |
| /eu_ES/distribucion | mobile | 88 | 61 | 82 | 54 |
| /eu_ES/distribucion | desktop | 83 | 61 | 81 | 77 |
| /eu_ES/servicios | mobile | 88 | 61 | 82 | 53 |
| /eu_ES/servicios | desktop | 83 | 61 | 81 | 78 |
| /eu_ES/contacto | mobile | 89 | 61 | 82 | 54 |
| /eu_ES/contacto | desktop | 85 | 61 | 81 | 77 |
| /eu_ES/conocenos | mobile | 88 | 61 | 82 | 54 |
| /eu_ES/conocenos | desktop | 83 | 61 | 81 | 77 |

**Observación**: `kit-consulting-es desktop A11y=80` es 3-5 puntos inferior al resto desktop (83-85). Posible causa: `link-in-text-block` (única página afectada por ese rule) que penaliza desktop más que mobile.

---

## 4. 🔴 Issues críticos (WCAG AA bloqueantes / SEO blockers)

### C1. `aria-required-parent` — `<a role="menuitem">` fuera de `[role="menu"]`

- **Páginas**: 12/12 (60 nodos totales).
- **Origen**: axe-core (Lighthouse no marca este rule específico).
- **Descripción**: cada link del navbar tiene `role="menuitem"` pero su contenedor no tiene `role="menu"` ni `role="menubar"`. WCAG SC 4.1.2 (Name, Role, Value).
- **Por qué crítico**: screen readers anuncian el elemento como si estuviera en un menú real → expectativa de keyboard-nav tipo arrow-keys que no existe → fricción de a11y severa para usuarios de NVDA/JAWS/VoiceOver.
- **Sample target**: `a[href="/"]` con `class="nav-link active"` y `role="menuitem"`.
- **Recomendación**: o (a) eliminar `role="menuitem"` (deja que el `<a>` actúe como link normal), o (b) envolver el `<ul>` del navbar en `[role="menubar"]` y los `<li>` en `[role="none"]`. Revisar de dónde viene el `role` — probablemente del template heredado `website.template_header_default` o de un override en `views/layout.xml`.
- **Esfuerzo**: **S** si se elimina el role; **M** si se reestructura semánticamente.

### C2. Meta description vacía en las 12 URLs

- **Páginas**: 12/12.
- **Origen**: SEO checks scripted + Lighthouse `meta-description` audit.
- **Descripción**: ningún `<meta name="description" content="...">` presente en `<head>` (excepto el placeholder Odoo vacío).
- **Por qué crítico**: Google genera snippets aleatorios del primer texto de la página (a menudo navegación o boilerplate de hero) → CTR de SERP pésimo. Específicamente bloquea el funnel B2B porque las queries de potenciales clientes verán texto desalineado del intent comercial.
- **Recomendación**: añadir `<meta name="description">` a cada `website.page` record (campo `arch` con un `<xpath expr="//head" position="inside">` por página o vía `website.page.menu_id`). 12 descripciones distintas (~140-160 chars cada una), una por página. Las descripciones deben mencionar Odoo + el sector/servicio + 17 años en industria + Avanzosc. Aprox. ~30 min copy + 30 min implementación.
- **Esfuerzo**: **M** (copy específico por página + propagación ES↔EU vía `i18n/eu.po`).

### C3. `color-contrast` — ratios <4.5:1 (WCAG 1.4.3 AA)

- **Páginas**: 12/12 (28 nodos totales).
- **Origen**: axe-core + Lighthouse.
- **Descripción**: elementos de texto con contraste insuficiente sobre su fondo. Sample: `<span>Soluciones</span>` dentro de un `<a href="#">` (item de dropdown del navbar — probablemente naranja sobre blanco o gris claro).
- **Por qué crítico**: WCAG 1.4.3 AA es legalmente exigible para empresa con cliente público europeo (EAA 2025 entra en vigor en junio); además afecta legibilidad real para usuarios con vista reducida y en sol directo.
- **Recomendación**: auditar visualmente la paleta `_variables.scss` con [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/). Pares sospechosos: `--brand-primary` sobre `--neutral-0`, `--brand-primary-dark` sobre `--brand-primary`. Posible que los `--neutral-*` necesiten oscurecerse 1-2 pasos. La paleta actual es propuesta inicial (CLAUDE.md §9.3 marca «pendiente extraer hex del logo») — ajuste forzoso.
- **Esfuerzo**: **M** (auditar 12 nodos sample, resolver causa raíz en variables, no edits puntuales).

### C4. `robots.txt: Disallow: /` — bloquea la indexación entera

- **Páginas**: globales (afecta todo el sitio).
- **Origen**: SEO check `_robots.json` + Lighthouse `is-crawlable`.
- **Descripción**: `controllers/main.py:robots()` devuelve `User-agent: * \n Disallow: /`. **INTENCIONAL** durante QA en `nueva.avanzosc.es` per Phase 10.2 + D6 (evita indexación pre-producción del subdominio).
- **Por qué crítico AHORA**: no es un bug — es un estado pre-switchover correcto. Pero **es bloqueante para producción**: si llega a Phase 10.5/10.6 sin flip, Google nunca indexará la web. La auditoría lo califica como crítico para asegurar que NO se olvida en el switchover.
- **Recomendación**: NO fixear en Sprint B; es acción del runbook switchover Phase 10.5/10.6. Verificar que el item está explícito en `docs/post-v1/switchover-runbook.md` (si no lo está, anotarlo). Cambio de 1 línea: `Disallow: /` → `Allow: /` (o eliminar el bloque restrictivo) en `controllers/main.py:robots()`. Smoke + verificar `curl -I avanzosc.es/robots.txt` post-DNS.
- **Esfuerzo**: **S** (1 línea + verificación post-switchover).

---

## 5. 🟡 Issues importantes

### I1. Site name «My Website» en cada `<title>` — branding default Odoo

- **Páginas**: 12/12.
- **Origen**: SEO check scripted (`_title_uniqueness.json`).
- **Descripción**: cada title termina en ` | My Website` (default Odoo). La home es además literalmente `Home | My Website` (sin marca).
- **Por qué importante**: branding terrible en SERP. «Avanzosc · Industrial | My Website» le grita al usuario «esta web no terminó de configurarse».
- **Recomendación**: cambiar el campo `name` de `website.website` (id=1) a `Avanzosc` desde Settings → Website (UI) o vía `data/website_config.xml` + `noupdate=1`. Para la home específicamente, sobreescribir el title del template `website.homepage` con uno explícito tipo `Avanzosc · Odoo industrial de verdad, desde 2008` (per claim D pre-spec).
- **Esfuerzo**: **S** (1 record write + override de la home). Propagar a `eu.po` (ya existe la entry «Home | …» en EU; ajustar a marca).

### I2. `<meta name="viewport" content="user-scalable=no">` bloquea zoom

- **Páginas**: 12/12.
- **Origen**: axe-core MODERATE + Lighthouse `meta-viewport` FAIL.
- **Descripción**: Odoo 14 default viewport incluye `user-scalable=no, maximum-scale=1`, lo que impide al usuario hacer zoom-in con pinch o `Ctrl++` en el navegador.
- **Por qué importante**: usuarios con vista reducida o necesidad de aumentar texto se quedan atrapados en el tamaño base. WCAG 1.4.4 (Resize Text) y 1.4.10 (Reflow). Es trivial de fixear pero recurrente.
- **Recomendación**: en `views/assets.xml` (o nuevo `views/head_overrides.xml`) sobreescribir el viewport de `web.layout` con `<meta name="viewport" content="width=device-width, initial-scale=1">` (sin `user-scalable=no`).
- **Esfuerzo**: **S**.

### I3. `<main>` duplicado en la mayoría de páginas (10/12)

- **Páginas**: todas excepto las 2 home (`/` y `/eu_ES/`). Sample: `industrial-es`, `contacto-es`, etc.
- **Origen**: axe-core (`landmark-no-duplicate-main` + `landmark-main-is-top-level` + `landmark-unique` — 3 rules con la misma raíz).
- **Descripción**: el HTML rendea DOS `<main>`:
  1. `<main id="wrapwrap">` — viene de `website.layout` de Odoo (raíz).
  2. `<main>` — viene de cada `views/pages/<page>.xml` que envuelve su contenido en `<div id="wrap"><main>...</main></div>` (patrón heredado del scaffolding inicial). Ej: `views/pages/contacto.xml:29`, `contacto_gracias.xml:29`, `industrial.xml`, etc.
- **Por qué importante**: HTML5 spec permite múltiples `<main>` solo si los demás son hidden — aquí no lo son. Screen readers anuncian dos landmarks «main», degradando la navegación por landmarks. Las 2 home no tienen el problema porque heredan de `website.homepage` directamente sin envolver en `<main>`.
- **Recomendación**: eliminar el `<main>` interno de las 10 páginas que lo tienen (mantener `<div id="wrap">...</div>` solo). El `<main id="wrapwrap">` de Odoo cubre el rol semántico.
- **Esfuerzo**: **S** (10 ediciones de 1 línea cada una; smoke).

### I4. `/eu_ES/` carece de `hreflang` en `<head>` (única URL afectada)

- **Páginas**: 1/12 (`home-eu` exclusivamente).
- **Origen**: SEO check (`hreflang` count = 0 en home-eu, 3 en las otras 11).
- **Descripción**: `curl http://localhost:14070/eu_ES/ | grep hreflang` no retorna nada. La misma página en ES (`/`) **sí** tiene los 3 `<link rel="alternate" hreflang>`.
- **Por qué importante**: Google usa hreflang para servir la versión correcta a cada usuario. La home EU sin hreflang significa que Google podría servir la versión ES a usuarios de EU (o no entender que existe versión ES y mostrar solo EU a hispanohablantes). Inconsistencia interna también — Odoo emite hreflang en 11 URLs pero no en la home EU.
- **Recomendación**: investigar de dónde sale el hreflang automático de Odoo (posiblemente `website.layout` o `website._get_alternate_langs`) y por qué no lo emite para la URL `/eu_ES/`. Hipótesis: el matcher considera el path `/` (sin lang prefix) como canónico y no genera alternates desde el lang-prefix variant. El sitemap.xml (controller custom) sí los declara correctamente, así que el daño SEO es parcial.
- **Esfuerzo**: **M** (investigar Odoo internals + posible override XML).

### I5. Title duplicado ES↔EU (5 pares)

- **Páginas**: 10/12 (5 pares ES+EU). `kit-consulting-es` y `conocenos-eu` no participan (asimétricos).
- **Origen**: SEO check (`_title_uniqueness.json`).
- **Descripción**: «Avanzosc · Industrial | My Website» idéntico en `industrial-es` y `industrial-eu`. Idem para distribución, servicios, contacto, home (ambos «Home | My Website»).
- **Por qué importante**: con `hreflang` correcto Google sabe diferenciarlas, pero el usuario en SERP no — verá el mismo título dos veces si Google muestra ambas, generando confusión. Además los slugs EU tampoco están traducidos (`/eu_ES/industrial`, no `/eu_ES/industriala` — bloqueado por Q1 lingüística).
- **Recomendación**: traducir el title vía `i18n/eu.po`. La entry «Avanzosc · Industrial» debería tener su EU equivalente «Avanzosc · Industria» (o lo que la validación lingüística Q1 confirme). Acoplado a I1 (rebrand del site name).
- **Esfuerzo**: **S** (5 entries en `eu.po`, sujeto a Q1).

### I6. `heading-order` skip h1→h3 en las 12 páginas

- **Páginas**: 12/12 (14 nodos totales).
- **Origen**: axe-core + Lighthouse.
- **Descripción**: el snippet `s_avanzosc_sectores_grid` usa `<h3 class="s_avanzosc_sectores_heading">Industrial</h3>` directamente (sin `<h2>` que lo encabece). Sample target: `.s_avanzosc_sectores_card[href$="industrial"] > .s_avanzosc_sectores_heading`.
- **Por qué importante**: WCAG 2.4.6 (Headings and Labels) — la jerarquía debe ser secuencial. Screen readers usan los headings para construir un table-of-contents navegable; saltos rompen esa estructura.
- **Recomendación**: o (a) cambiar los `<h3>` de los sectores a `<h2>` (decisión semánticamente correcta — son headings de sección de la home), o (b) añadir un `<h2>` invisible o visualmente ligero a la sección «Soluciones para tu sector» antes del grid. (a) es más limpio.
- **Esfuerzo**: **S** (cambio en `views/snippets/sectores_grid.xml` + posible ajuste de `_sectores.scss` si el tamaño visual de h2 difiere).

### I7. Open Graph: `og:description` ausente en 12/12

- **Páginas**: 12/12.
- **Origen**: SEO check scripted.
- **Descripción**: `og:title` y `og:image` presentes (Odoo default), pero `og:description` no.
- **Por qué importante**: cuando el sitio se comparte en LinkedIn / Twitter / Slack, falta el snippet descriptivo bajo el título. Aplica especialmente para LinkedIn (audiencia B2B principal).
- **Recomendación**: emparejar con C2 (meta description) — `og:description` se puede declarar igual a `<meta name="description">` mediante un xpath en `<head>` que duplique el valor.
- **Esfuerzo**: **S** (acoplar a C2).

### I8. Twitter Card: `twitter:title` y `twitter:description` ausentes

- **Páginas**: 12/12.
- **Origen**: SEO check.
- **Descripción**: `twitter:card` declarado (default Odoo) pero sin title/description. LinkedIn ignora Twitter Cards, Twitter sí los usa.
- **Por qué importante**: Twitter/X no es el canal B2B principal pero sí se usa por consultores y CTOs de empresas industriales. Coste mínimo de añadirlo.
- **Recomendación**: emparejar con C2 + I7 (mismo bloque `<head>` xpath).
- **Esfuerzo**: **S** (acoplar a C2).

### I9. `scrollable-region-focusable` — `.s_avanzosc_timeline_track` sin foco teclado

- **Páginas**: 2/12 (`home-es` y `home-eu`).
- **Origen**: axe-core SERIOUS.
- **Descripción**: el snippet `timeline_trayectoria` tiene un track horizontal scrollable, pero el contenedor no tiene `tabindex="0"` ni `role` apropiado, así que un usuario de teclado no puede entrar en él para scrollearlo con flechas.
- **Por qué importante**: WCAG 2.1.1 (Keyboard) — todo contenido scrollable debe ser accesible por teclado. Para usuarios sin ratón es una zona muerta.
- **Recomendación**: añadir `tabindex="0"` + `role="region"` + `aria-label="Trayectoria Avanzosc 2008-2024"` al `.s_avanzosc_timeline_track`. Verificar también que el scroll horizontal por flechas funciona (el browser lo gestiona automáticamente al recibir foco).
- **Esfuerzo**: **S** (3 atributos en `views/snippets/timeline_trayectoria.xml`).

---

## 6. 🟢 Issues mejoras / nice-to-have

### N1. `link-in-text-block` — link sin underline distinguido en `/kit-consulting`

- **Páginas**: 1/12 (`kit-consulting-es`, 1 nodo).
- **Origen**: axe-core SERIOUS (pero ámbito limitado).
- **Descripción**: link `<a href="https://www.kitconsulting.es">kitconsulting.es</a>` en un párrafo sin estilo distintivo de los `<a>` por defecto del módulo. Solo el color (que es similar al texto circundante en algunos contextos) lo diferencia.
- **Por qué mejora y no importante**: solo 1 página afectada y la probabilidad de que un usuario llegue ahí sin contexto es baja (página dedicada a un programa). Aún así WCAG 1.4.1 (Use of Color).
- **Recomendación**: regla CSS global para `<a>` dentro de `<p>` con `text-decoration: underline` o un border-bottom claro. Coste: 1 regla CSS.
- **Esfuerzo**: **S**.

### N2. `empty-table-header` — `<th></th>` en horario `/contacto`

- **Páginas**: 2/12 (`contacto-es`, `contacto-eu`).
- **Origen**: axe-core MINOR.
- **Descripción**: `views/pages/contacto.xml:97` tiene `<tr><th></th><td>15:00 - 17:30</td></tr>` — la segunda fila del horario con celda L-V vacía (porque el rango ya es continuación del L-V de la fila anterior).
- **Por qué mejora: minor impact, decisión de diseño aceptable** — la tabla se entiende visualmente.
- **Recomendación**: o (a) usar `aria-label="L-V"` en el `<th>` para que screen readers lo lean coherente, o (b) reestructurar la tabla para no tener celdas vacías (un solo `<th>L-V</th>` con dos `<td>` apilados, o cambiar a `<dl>`/`<dt>`/`<dd>`).
- **Esfuerzo**: **S**.

### N3. Lighthouse Best Practices — `deprecations`

- **Páginas**: 12/12.
- **Origen**: Lighthouse Best Practices FAIL.
- **Descripción**: el bundle `web.assets_frontend` de Odoo 14 usa APIs deprecated del navegador (probablemente `unload` listeners, `MutationEvent`, o similar legacy). Heredado del stack.
- **Por qué mejora y no importante**: no afecta funcionalidad, puede afectar perf futura cuando Chrome retire las APIs (años fuera).
- **Recomendación**: NO fixear en v1. Documentar como deuda v2 cuando se evalúe migración a Odoo 15+/16+.
- **Esfuerzo**: **L** (no aplicable a Sprint B).

### N4. Lighthouse Best Practices — `valid-source-maps`

- **Páginas**: 12/12.
- **Origen**: Lighthouse Best Practices FAIL.
- **Descripción**: bundles JS grandes (Odoo `web.assets_common`, `web.assets_frontend`) sirven minificados sin source maps.
- **Por qué mejora y no importante**: source maps son útiles para debugging en producción, no para usuarios finales. Activarlos en producción puede exponer source code privado, así que es trade-off.
- **Recomendación**: NO fixear. Decisión de Odoo upstream.
- **Esfuerzo**: **N/A**.

---

## 7. Notas

### 7.1. Performance localhost no representativa

Los scores de Performance (mobile 48-55, desktop 76-92) **NO son indicador real** de la experiencia en producción. Lighthouse aplica:
- CPU throttling 4× (mobile) / 1× (desktop).
- Network throttling Slow 4G (mobile) / sin throttling (desktop).

Localhost dev server no tiene CDN, no tiene HTTP/2 push, no tiene compresión Brotli, y los assets se sirven uno por uno. Métricas tipo LCP 16 s mobile son artefacto del entorno, no de la web.

**Re-validar tras switchover Phase 10.6 con `https://avanzosc.es/`** per [`deferred-ttfb-prod`](../../decisions-log.md#deferred-ttfb-prod). Si TTFB mediano >300 ms o load >700 ms, abrir Propuesta B (D20).

### 7.2. Hallazgos que merecen entrada en decisions-log (propuestas)

Sprint B decide; aquí solo proponemos:

- **Si C1 (`aria-required-parent`) requiere reestructurar el navbar entero** (no quitar el role) → entrada D26 documentando la decisión semántica del menú.
- **Si C3 (`color-contrast`) fuerza ajustar la paleta brand** → entrada en CLAUDE.md §9.3 actualizando la tabla de hex (que ya está marcada como «pendiente extraer del logo»). Ya está en pendientes; el audit acelera la decisión.
- **Si I3 (`<main>` duplicado) se fixea con un patrón sistemático** (e.g., scaffolding template QWeb común que las 10 pages reusen) → entrada D27 documentando el patrón para futuras páginas.
- **Si C4 (`robots.txt` flip) NO está explícito en `docs/post-v1/switchover-runbook.md`** → añadirlo allí, no en decisions-log. Verificar.

### 7.3. Distribución de severidad — gráfico textual

```
🔴 Critical : ████ 4 issues  (60% impacto, 25% esfuerzo agregado)
🟡 Important: █████████ 9 issues
🟢 Mejoras  : ████ 4 issues  (1 fixeable rápido, 2 deuda Odoo upstream)
```

Sprint B con scope «solo críticos + importantes-S» = 4 + 7 issues = ~3-4 horas estimadas (excluyendo C2 que es M por copy).

---

## 8. Archivos generados

```
docs/audits/2026-05-04-a11y-seo/
├── REPORT.md                                    (este archivo, deliverable principal)
├── lighthouse/                                  (48 archivos: 24 runs × json+html)
│   ├── home-es-mobile.report.{json,html}
│   ├── home-es-desktop.report.{json,html}
│   ├── ... (12 URLs × 2 forms)
├── axe-core/                                    (12 archivos)
│   ├── home-es.json
│   ├── industrial-es.json
│   ├── ...
└── seo-checks/                                  (15 archivos: 12 URLs + 3 globales)
    ├── home-es.json
    ├── ...
    ├── _robots.json
    ├── _sitemap.json
    └── _title_uniqueness.json
```

Scripts one-shot usados (NO commiteados, viven en `/tmp/`):
- `/tmp/lh-runner.sh` — orquestación de las 24 corridas Lighthouse.
- `/tmp/seo-checks.js` — Node 20 stdlib SEO checks.
- `/tmp/axe-runner.js` — puppeteer-core + axe-core (Chrome del sistema).

Re-ejecución: requiere reinstalar `puppeteer-core` + `axe-core` en `/tmp/node_modules/` y volver a invocar los scripts. Si Sprint B vuelve a auditar, mejor archivar los scripts en `scripts/audit/` y commitearlos como tooling reusable.
