# Snippets snapshots — Phase 3

Inicial: 2026-04-28. Capturas de los 10 snippets v1 implementados en
Phase 3 (Tasks 3.1-3.10), tomadas en la página de QA `/test-snippets`.
Cada snippet rinde una entrada bilingüe (ES + EU) cuando aplica copy
traducible. Mismo formato heading-per-entry que los demás folders de
`snapshots/`.

---

## pilares-1280-es.png

**What it represents:** Snippet `s_avanzosc_pilares` (Task 3.1) renderizado
en `/test-snippets` a viewport 1280×800 (full-page, sesión pública).
Versión castellana (lang `es_ES`).

**Layout (3 columnas Bootstrap `col-12 col-md-4`):**

| # | Número | 1-line ES |
|---|---|---|
| 1 | **2008** | En el ecosistema Odoo desde OpenERP. |
| 2 | **600+** | Módulos publicados, muchos en OCA. |
| 3 | **STEM** | Ingenieras y mayoría femenina. |

**Diseño visual** (decisiones A-H sesión 2026-04-28):

- Background `var(--neutral-100, #F4F5F7)` (D — alterno suave vs hero).
- Padding 5rem desktop / 3rem mobile (G).
- Número: Space Grotesk 64px peso 600, color `--neutral-900`,
  letter-spacing -0.02em (CLAUDE.md §9.4 H1 spec).
- 1-line: Inter 1.125rem peso 400, color `--neutral-700`, max-width 16rem.
- Sin iconos (E — el número grande es la jerarquía visual dominante).
- Sin CTA (F — bloque de prueba social, no acción).

**Animación de entrada** (verificada con Playwright):

- IntersectionObserver con `threshold: 0.2` añade clase `.is-revealed`
  al `<section>` al entrar 20% en viewport.
- SCSS define la transición opacity 0→1 + translateY 20px→0,
  duración 600ms, easing `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out expo).
- Stagger 100ms entre columnas vía `:nth-child` + `transition-delay`
  (más simple que JS).
- One-shot: `observer.unobserve(section)` tras revelar.
- `prefers-reduced-motion`: estado final directo (mixin neutraliza
  `transition` y aplica opacity 1 + transform identity).

- **URL:** `http://localhost:14070/test-snippets` (cookies clear → ES default).
- **Viewport:** 1280×800 px (fullPage).
- **Sesión:** pública (sin login).
- **Module commit:** Task 3.1 HEAD (ver `git log`).
- **Date:** 2026-04-28.

---

## pilares-1280-eu.png

**What it represents:** Misma página `/eu_ES/test-snippets`, viewport 1280,
versión euskera. Verifica que las 3 traducciones DRAFT del eu.po se
aplican correctamente al snippet vía `model_terms:ir.ui.view,arch_db:
website_avanzosc_demo.s_avanzosc_pilares` annotation.

**1-lines EU rendered:**

| # | Número | 1-line EU (DRAFT) |
|---|---|---|
| 1 | **2008** | OpenERPetik Odoo ekosisteman. |
| 2 | **600+** | Argitaratutako moduluak, asko OCAn. |
| 3 | **STEM** | Ingeniariak eta emakume gehienak. |

Las 3 strings están marcadas `#, fuzzy` + `# DRAFT - REVIEW NEEDED` en
`i18n/eu.po` per CLAUDE.md Q1 (gate de revisión lingüística por equipo
Avanzosc antes de levantar el flag fuzzy).

Los números **2008**, **600+** y **STEM** NO se traducen (idénticos en
ambos idiomas, igual que el copyright literal del footer). El navbar y
footer también muestran sus versiones EU correspondientes (de Phase 2).

- **URL:** `http://localhost:14070/eu_ES/test-snippets`.
- **Viewport:** 1280×800 px (fullPage).
- **Sesión:** pública (sin login).
- **Module commit:** Task 3.1 HEAD (ver `git log`).
- **Date:** 2026-04-28.

---

## Notas operativas Phase 3

- La página `/test-snippets` se inicializa en Task 3.1 con un solo
  `t-call` (al snippet `s_avanzosc_pilares`). Las Tasks 3.2-3.10
  añaden t-calls subsiguientes a la misma página, acumulando los 10
  snippets para el gate de verificación visual de Task 3.11.
- El destino final de `/test-snippets` se decide en 3.11: o bien se
  elimina (la home `/` cubrirá la verificación visual con los snippets
  reales en Phase 4), o bien se mantiene como herramienta de QA para
  iteraciones futuras.
- NO está registrada en website builder (CLAUDE.md §11 D4 — todo por
  código, sin drag&drop). NO está indexada por buscadores
  (`website_indexed=False` en el record de `website.page`).
