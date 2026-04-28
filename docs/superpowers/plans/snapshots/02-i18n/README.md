# i18n snapshots — Phase 2

Inicial: 2026-04-28. Capturas tras los hitos de Phase 2 (i18n base: activación
EU + traducciones del menú + redirects 301). Sirve de evidencia visual del
estado bilingüe ES/EU en este punto del proyecto. Mismo formato heading-per-
entry que los demás folders de `snapshots/`.

---

## menu-eu-1280-full.png

**What it represents:** Full page del local Odoo 14 a `/eu_ES/` tras
**Phase 2 completa** (Tasks 2.1 retro D10 + 2.2 + 2.2 DA + 2.2 DB +
2.3 + 2.4). Sesión pública (sin admin chrome). Captura con el dropdown
«Konponbideak» expandido para mostrar los 4 hijos sectoriales también
en EU. Es la primera evidencia visual del sitio funcionando en el
idioma secundario completo.

**Coverage EU verificada (Playwright):**

- **Header navbar top-level (7 items):**
  - Visibles (5): Hasiera · Konponbideak (▾) · Denda · Formakuntza · Harremanetan.
  - En overflow `[+]` (2): Ezagutu gaitzazu · Lana.
- **Dropdown children de Konponbideak (4):** Industriala · Banaketa · Zerbitzuak · Akademiak.
- **Footer 4 columnas + bottom strip:**
  - Brand col: claim «Benetako Odoo industriala, 2008tik.»
  - Headings: KONPONBIDEAK · ENPRESA · LEGALA.
  - Links Soluciones: Industriala · Banaketa · Zerbitzuak · Akademiak.
  - Links Empresa: Ezagutu gaitzazu · Lana · Harremanetan.
  - Links Legal: Lege Oharra · Pribatutasun Politika · Cookieen Politika.
- **Bottom strip:** copyright literal `© 2026 Avanzosc S.L. — CIF B20875340`
  (NO se traduce — identificador legal idéntico) + lang button «Euskara ▾».

**Total: 26/26 strings traducidos** (11 menú + 15 footer).

**Notas técnicas (CLAUDE.md §11 D9):**

- Source language: castellano (`es_ES`) hardcoded en QWeb / data XML.
- Target EU: traducciones en `i18n/eu.po`, todas marcadas `#, fuzzy` + tag
  `# DRAFT - REVIEW NEEDED` per Q1 cerrada (gate de revisión lingüística
  por equipo Avanzosc antes de levantar el flag fuzzy).
- Mecanismo: anotaciones `#:` por surface (model.field). Para strings que
  aparecen en múltiples surfaces (e.g. «Soluciones» en menú y footer),
  una sola entry con múltiples `#:` lines aplica el msgstr a todas.
- Dropdown children sin xml_id en data XML (los crea el `post_init_hook`):
  el hook registra `ir.model.data` por cada child para que `eu.po` pueda
  referenciarlos via `#: model:website.menu,name:website_avanzosc_demo.menu_<sector>`.

**Limitaciones conocidas en este snapshot:**

- URLs EU mantienen los slugs ES (`/eu_ES/industrial` no `/eu_ES/industriala`).
  Decisión DC sesión 2026-04-28: los slugs traducidos D2 spec se aplican
  cuando se creen los `website.page` (Phases 4-5) — `website.menu.url` no
  es traducible y los redirects EU no son scope de Phase 2.
- Botón «Acceso clientes» del header sigue en castellano. No estaba en el
  scope explícito de Phase 2 (Task 2.2 cubrió solo strings del menú);
  diferido a tarea i18n posterior si se decide traducir.
- Logo placeholder «Your logo» del header y footer brand col: pendiente de
  cierre [?] #5 spec (logo SVG real).

- **URL:** `http://localhost:14070/eu_ES/?_=cb` (cache-bust)
- **Viewport:** 1280×800 px (fullPage)
- **Sesión:** pública (sin login)
- **Dropdown «Konponbideak»:** abierto via `.dropdown-toggle.click()` antes
  del screenshot, para evidenciar los 4 children sectoriales.
- **Module commit:** Phase 2 closure HEAD (ver `git log`)
- **Date:** 2026-04-28
