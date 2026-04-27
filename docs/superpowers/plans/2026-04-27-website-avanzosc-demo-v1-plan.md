# `website_avanzosc_demo` v1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** entregar v1 del módulo `website_avanzosc_demo` (home + 4 sectoriales + corporativas + 3 legales + skin sobre `website_sale`/`website_slides`), bilingüe ES + EU, listo para QA en `nueva.avanzosc.es` y switchover posterior.

**Architecture:** módulo Odoo 14 custom sobre `website`. Bootstrap 5 (el de v14), SCSS por snippet, JS `odoo.define()` + `publicWidget`. Animaciones GSAP 3 + Splitting.js + Lenis + IntersectionObserver. Snippets como fragmentos QWeb privados, NO registrados en builder (D4). Páginas como `website.page`. i18n nativo con slugs traducidos al euskera bajo `/eu/`.

**Tech Stack:** Odoo 14 Community · Python 3.10 · Bootstrap 5 · SCSS · GSAP 3.12.5 · ScrollTrigger 3.12.5 · Splitting.js 1.0.6 · Lenis 1.0.42 · Lucide Icons 0.453.x.

**Doc canónico:** `docs/superpowers/specs/2026-04-27-website-avanzosc-demo-design.md` (=spec). `CLAUDE.md` = convenciones inmutables.

**Comandos** (CLAUDE.md §7):

```bash
# Smoke test (CLAUDE.md §12 regla #6 — gestiona dev server + log automáticamente)
./scripts/run-smoke.sh <task-id>

# Servidor dev (terminal del usuario; el script lo arranca/para por sí mismo cuando es necesario)
/opt/odoo/v14/venv/bin/python /opt/odoo/v14/base/odoo-bin -c /etc/odoo/odoo14_community.conf --dev=all -d odoo14_community
```

**Convenciones:** cada tarea = `Files / Ref / Acceptance / Deps [/ Bloqueo]`. Atómicas 30 min – 4 h. Commits NO se planifican (usuario decide). Smoke + Playwright + gate humano al final de cada fase. 8 `[?]` del spec §13 + 2 gates de sesión (Q1 TRANSLATION DRAFT, Q3 revisión legal) → bloqueos blandos asignados a tareas concretas; tabla al final.

---

## Phase 0 — Setup técnico

**0.1 — Esqueleto del módulo.** Files: `__init__.py`, `__manifest__.py`, `models/__init__.py`, `.gitkeep` en data/views/snippets/scss/js/img/description. Ref: spec §3.1, CLAUDE.md §8. Acceptance: árbol idéntico a CLAUDE.md §8 (incluye `sector_specifics.xml` reservado). Manifest con `depends=['website','website_sale','website_slides']`, `installable=True`. Deps: ninguna.

**0.2 — Snapshot Playwright pre-cambios.** Files: PNGs en `docs/superpowers/plans/snapshots/00-baseline/`. Ref: CLAUDE.md §6. Acceptance: home actual de `https://avanzosc.es` y home Odoo limpio en 1280×800 y 375×667. Deps: 0.1.

**0.3 — Google Fonts + Lucide en assets.** Files: `views/assets.xml` (nuevo). Ref: CLAUDE.md §4, spec §3.3 / §9.4 / §9.7. Acceptance: `<template inherit_id="web.layout">` con `xpath expr="//head"` inyecta en `<head>` los `<link>` Google Fonts (preconnect + stylesheet con Space Grotesk 500/600, Inter 400/500/600, JetBrains Mono) y el `<script>` Lucide CDN `https://cdn.jsdelivr.net/npm/lucide@0.453.0/dist/umd/lucide.min.js`. La llamada `lucide.createIcons()` vive en `static/src/js/main.js` dentro de `publicWidget.AvanzoscRoot.start()`. **Razón de `web.layout` y NO `web.assets_frontend`** (spec §3.3): `<link rel="preconnect">` requiere estar en `<head>` para funcionar; el bundler de assets convertiría URLs externas a `@import` perdiendo preconnect; el script Lucide debe estar disponible como global `window.lucide` antes de los bundles defer de Odoo. Verificable: `curl http://localhost:14070 | grep -E "googleapis|lucide"`. Deps: 0.1.

**0.4 — GSAP + ScrollTrigger + Splitting.js + Lenis CDN.** Files: modify `views/assets.xml`. Ref: spec §9.1. Acceptance: en orden y antes del JS propio: `gsap.min.js` 3.12.5 cdnjs, `ScrollTrigger.min.js` 3.12.5 cdnjs, `splitting.min.js` + `splitting.css` 1.0.6 jsDelivr, `lenis.min.js` 1.0.42 jsDelivr (`@studio-freight/lenis`). Deps: 0.3.

**0.5 — SCSS base.** Files: `static/src/scss/_variables.scss` `_mixins.scss` `_typography.scss` `main.scss`; modify `views/assets.xml`. Ref: CLAUDE.md §4 SCSS, §9.3, §9.4. Acceptance: `_variables.scss` con las 12 vars de §9.3 (valores propuestos). `_mixins.scss` con `@mixin reduced-motion`. `_typography.scss`: Space Grotesk en h1-h3, Inter en body, JetBrains Mono en code. Tras instalación, body computed = Inter, h1 = Space Grotesk. Deps: 0.4. **Bloqueo:** [?] #3 spec — hex finales del logo. Comentario `// TODO #spec-q3` en valores propuestos.

**0.6 — JS skeleton main.js + Lenis global.** Files: `static/src/js/main.js`; modify `views/assets.xml`. Ref: CLAUDE.md §4 JS. Acceptance: `odoo.define('website_avanzosc_demo.main', ...)` instancia Lenis con defaults; respeta `prefers-reduced-motion` (no inicia Lenis si match). DevTools: `window.lenis` definido. Deps: 0.4, 0.5.

**0.7 — Smoke test + gate humano.** Acceptance: comando smoke pasa sin tracebacks. Screenshot Playwright home Odoo nuevo (sólo fonts+Lucide, sin layout custom). Gate: OK del usuario antes de Phase 1. Deps: 0.1–0.6.

---

## Phase 1 — Layout base (header desktop + footer)

**1.1 — `data/menu.xml` con 7 items ES.** Files: `data/menu.xml`; modify manifest. Ref: CLAUDE.md §2, spec §8.1. Acceptance: `<record model="website.menu">` por item: Inicio, Soluciones (parent), Industrial/Distribución/Servicios/Academias (4 hijos), Tienda, Formación, Conócenos, Trabaja con nosotros, Contacto. URLs ES `/`, `#`, `/industrial`, `/distribucion`, `/servicios`, `/academias`, `/tienda`, `/formacion`, `/conocenos`, `/trabaja-con-nosotros`, `/contacto`. URLs aún 404 (esperado hasta Phase 4-6). Deps: Phase 0.

**1.2 — `views/layout.xml` header desktop.** Files: `views/layout.xml`. Ref: spec §8.1. Acceptance: herencia de `website.layout` xpath `//header`, reemplaza por flex `[logo SVG placeholder 40×40 "AV"] [menú con dropdown Soluciones] [switcher ES|EU con clase active según `request.lang`] [<a href="/web/login" class="btn btn-primary">Acceso clientes</a>]`. Deps: 1.1. **Bloqueos:** [?] #3 spec (logo SVG real); [?] #2 spec (URL portal).

**1.3 — SCSS header sticky.** Files: `_header.scss`; modify main.scss. Ref: spec §8.1, CLAUDE.md §5 (sólo transform/opacity). Acceptance: desktop `position: sticky; top: 0;`. Tras 80px scroll, clase `.is-scrolled` reduce padding interno (custom property `--header-pad`) y aumenta opacidad fondo 0.95→1.0, transición 200ms ease-out. Deps: 1.2.

**1.4 — JS header is-scrolled.** Files: `static/src/js/snippets/header.js`; modify assets.xml. Ref: spec §8.1. Acceptance: `publicWidget` selector `header.o_header_avanzosc` registra `ScrollTrigger.create({ trigger: 'body', start: '80px top', toggleClass: { targets: 'header.o_header_avanzosc', className: 'is-scrolled' } })`. Verificable: clase aparece >80px scroll. Deps: 1.3.

**1.5 — `views/layout.xml` footer.** Files: modify `views/layout.xml`. Ref: spec §8.2. Acceptance: xpath `//footer` reemplaza con 3 columnas + barra. COL1=Avanzosc(Conócenos/Trabaja/Contacto). COL2=Soluciones(4 sectoriales). COL3=Contacto(`tel:+34943026902`, `mailto:comercial@avanzosc.es`, dirección). Barra: `© 2026 Avanzosc S.L. · CIF B20875340 · Aviso legal · Política de privacidad · Cookies`. Links legales a `/aviso-legal`, `/politica-de-privacidad`, `/politica-de-cookies` (404 hasta Phase 6 — esperado). Datos según CLAUDE.md §11 "Datos legales del footer (vigentes)". Deps: 1.1.

**1.6 — SCSS footer.** Files: `_footer.scss`; modify main.scss. Ref: spec §8.2, CLAUDE.md §9.8. Acceptance: fondo `--brand-secondary`, texto `--neutral-100`, grid 1col<768px / 3cols≥768px, barra inferior `border-top: 1px solid rgba(255,255,255,.1)`. Deps: 1.5.

**1.7 — Verificación visual + smoke + gate.** Files: PNGs en `snapshots/01-layout/`. Acceptance: home Odoo en 1280×800: header 7 items + dropdown + switcher + Acceso clientes; footer 3 cols + barra. Header sticky funciona al scroll. Smoke pasa. Gate humano. Deps: 1.6, 1.4.

---

## Phase 2 — i18n base

**2.1 — Activar EU en website.** Files: `data/website_config.xml`; modify manifest. Ref: spec §4.1, CLAUDE.md §11 "Idiomas". Acceptance: `<function model="res.lang" name="load_lang">` activa `eu_ES`. Default website con `language_ids=[es_ES, eu_ES]`, `default_lang_id=es_ES`. Switcher en website muestra ambos. Deps: Phase 1.

**2.2 — Traducciones EU del menú con TRANSLATION DRAFT marker.** Files: modify `data/menu.xml`. Ref: spec §4.2, D2, Q1. Acceptance: `<field name="name" lang="eu_ES">` por item EU: Hasiera, Sektorialak, Industriala, Banaketa, Zerbitzuak, Akademiak, Denda, Formakuntza, Ezagutu gaitzazu, Lan egin gurekin, Kontaktua. URLs EU: 4 sectoriales con slugs traducidos D2; resto con slugs propuestos. **Cada string borrador con comentario adyacente `<!-- TRANSLATION DRAFT - REVIEW NEEDED -->`** (los 4 sectoriales NO llevan marcador — slugs validados D2). `grep -c "TRANSLATION DRAFT" data/menu.xml` >0. Deps: 2.1, 1.1. **Bloqueo:** [?] #1 spec (slugs no sectoriales).

**2.3 — `data/redirects.xml` 12 entradas.** Files: `data/redirects.xml`; modify manifest. Ref: spec §11, D6. Acceptance: `<record model="website.rewrite">` con `url_from`, `url_to`, `redirect_type=301` por cada fila confirmada §11: `/page/contactenos`→`/contacto`, `/page/sobre-nosotros`→`/conocenos`, `/page/cursos`→`/slides`, `/formacion`→`/slides`, `/tienda`→`/shop`, `/page/industria-4-0`→`/industrial`, `/page/retail`→`/distribucion`, `/page/servicios-it`→`/servicios`, `/page/educacion`→`/academias`. Filas `[?]` (`/blog`, `/blog/categoria/*`, `/page/kit-digital`) **comentadas con TODO**. Deps: 2.1. **Bloqueos:** [?] #5 spec (`/blog/*`); [?] #6 spec (`/kit-digital`).

**2.4 — Verificación redirects + i18n + smoke + gate.** Acceptance: `curl -sI /tienda` → 301 Location `/shop`; `curl -sI /formacion` → 301 `/slides`; `curl -sI /eu/` → 200 lang=eu; `curl -sI /` → 200 lang=es. Switcher header cambia entre `/` y `/eu/`. Smoke pasa. Gate. Deps: 2.3, 2.2.

---

## Phase 3 — Snippets

10 snippets en orden de complejidad creciente. Cada uno = 1 tarea atómica. Todos llevan EU borrador con TRANSLATION DRAFT marker en strings de copy (excepto snippets sin texto fijo o con strings ya validados como el claim del hero).

### 3a — Simples (sin animación compleja)

**3.1 — `s_avanzosc_pilares`.** Files: `views/snippets/pilares.xml`, `_pilares.scss`, `pilares.js`; modify manifest+main.scss+assets.xml. Ref: spec §6.2. Acceptance: 3 cols `col-12 col-md-4` con (Desde 2008 / 600+ módulos OCA / Equipo STEM). Cada col: número 64px Space Grotesk + 1-line. JS reveal IO (opacity 0→1 + translateY 20px→0, 600ms ease-out expo, stagger 100ms). Deps: Phase 2.

**3.2 — `s_avanzosc_sectores`.** Files: `sectores_grid.xml`, `_sectores.scss`, `sectores.js`. Ref: spec §6.3. Acceptance: grid 2x2 con 4 cards (Industrial/Distribución/Servicios/Academias), icono Lucide grande + título + 1-line + link al sectorial (slug ES o EU según `request.lang`). Hover: `translateY(-4px)` + sombra 200ms. Reveal IO. Deps: 3.1.

**3.3 — `s_avanzosc_cta_kit_consulting`.** Files: `cta_kit_consulting.xml`, `_cta_kit_consulting.scss`. Ref: spec §6.8. Acceptance: banner full-width fondo `--brand-accent`, título 32px, CTA `<a href="/kit-consulting" class="btn btn-secondary">Consulta tu elegibilidad</a>`. Sin JS. Banner se traduce a EU (la página landing es ES-only D5). Deps: 3.1.

**3.4 — `s_avanzosc_cta_contacto`.** Files: `cta_contacto.xml`, `_cta_contacto.scss`, `cta_contacto.js`. Ref: spec §6.9. Acceptance: bloque centrado, título 40px («Hablemos»/«Hitz egin dezagun»), tel + email + form HTML5 (nombre, email, empresa, mensaje), action `/website_form/mail.mail`. JS valida required + email; en error añade `.is-invalid`. Reveal IO. Deps: 3.1.

### 3b — Con IntersectionObserver

**3.5 — `s_avanzosc_contador`.** Files: `contador_modulos.xml`, `_contador.scss`, `contador.js`. Ref: spec §6.4, §9.2. Acceptance: número 100-120px Space Grotesk + label «módulos OCA contribuidos». IO threshold 0.5: interpola 0→600 en 1200ms ease-out cubic, **sólo la primera vez** (flag por instancia). Reduced-motion: 600 directo. Deps: 3.1.

**3.6 — `s_avanzosc_caso_exito` + dict de 8 archetypes.** Files: `caso_exito.xml`, `_caso_exito.scss`, `caso_exito.js`. Ref: spec §6.6 §10, Q2. Acceptance: template define dict QWeb con 8 entradas, campos `{title, sector, subsector, capability_summary, capability_details: [...]}` espejo del futuro modelo. Comentario XML: `<!-- ARCHETYPE DICT: estructura espejo del futuro modelo website.avanzosc.archetype (v2). Migrable sin tocar markup. -->`. Recibe `archetype_id` (vía `t-call`) o lee `ir.config_parameter.get_param('website_avanzosc_demo.featured_archetype_id', '1')`. Renderiza card: title, summary grande, details como bullets, dashboard SVG inline 600×400 placeholder. **Anonymous-first** (sin nombre, sin logo). JS reveal + parallax sutil ≤30%. Deps: 3.5.

**3.7 — `s_avanzosc_sector_specifics`.** Files: `sector_specifics.xml`, `_sector_specifics.scss`, `sector_specifics.js`. Ref: spec §6.10 §7.2, D1. Acceptance: template con parámetros QWeb `title`, `intro`, `items` (lista). Renderiza h2 + intro + lista con icono Lucide por item. Reveal IO. Sin contenido específico aquí — payloads en Phase 5. Deps: 3.5.

### 3c — GSAP avanzado

**3.8 — `s_avanzosc_timeline`.** Files: `timeline_trayectoria.xml`, `_timeline.scss`, `timeline.js`. Ref: spec §6.5, CLAUDE.md §9.1 pilar 1, §5. Acceptance: 7 hitos hardcoded (2008 TinyERP, 2010 Jornadas Bilbao, 2012 Donosti, 2014 Odoo+OdooMRP, 2019 grupo 7 colegios, 2022 Kit Digital, 2024 Kit Consulting). Desktop horizontal con scroll lateral si overflow; mobile vertical. JS ScrollTrigger marca progreso (línea coloreada avanza); parallax ≤30% en fondo. Reduced-motion: sin parallax ni progreso animado. Deps: 3.5.

**3.9 — `s_avanzosc_equipo`.** Files: `equipo.xml`, `_equipo.scss`, `equipo.js`. Ref: spec §6.7, CLAUDE.md §9.1 pilar 3. Acceptance: grid de retratos placeholder (silueta SVG por persona) + nombre + titulación + especialidad. Hover: detalle expandido. JS GSAP stagger 60ms ease-out expo. Lista hardcoded en QWeb. Comentario `<!-- TODO #spec-q8: replace with real photos -->`. Deps: 3.5. **Bloqueo:** [?] #8 spec (sesión fotográfica).

**3.10 — `s_avanzosc_hero` + Splitting.js.** Files: `hero.xml`, `_hero.scss`, `hero.js`. Ref: spec §6.1 §9.2, CLAUDE.md §11 "Claim de la home". Acceptance: parámetros QWeb `claim`, `subtitle`, `cta_primary_text`, `cta_primary_url`, `cta_secondary_text`, `cta_secondary_url`. Defaults: claim ES «Odoo industrial de verdad, desde 2008.», EU «Benetako Odoo industriala, 2008tik.» (validados, NO TRANSLATION DRAFT). H1 64-72px Space Grotesk peso 600. JS GSAP Timeline: (1) Splitting.js split por letra, stagger 30ms ease-out expo total ≤800ms; (2) subtítulo fade+translateY 12px→0 300ms delay 600ms; (3) CTAs fade 300ms delay 900ms. Reduced-motion: estado final directo. Deps: 3.8.

**3.11 — Verificación visual de los 10 snippets aislados + smoke + gate.** Files: PNGs en `snapshots/03-snippets/`. Acceptance: crear página temporal `/test-snippets` que renderiza cada snippet con datos de muestra. Screenshot 1280×800 de cada uno. Verifica: animaciones se disparan al scroll; reveal funciona; contador anima sólo una vez; hero anima letra a letra. Smoke. Gate. Deps: 3.1–3.10.

---

## Phase 4 — Composición de la home

**4.1 — `data/website_pages.xml` registro home.** Files: `data/website_pages.xml`; modify manifest. Ref: spec §5. Acceptance: `<record model="website.page">` ES con `url='/'`, `view_id` apuntando a `website_avanzosc_demo.page_home`. Equivalente EU `url='/eu/'` (Odoo gestiona `url` traducible). Deps: Phase 3.

**4.2 — `views/pages/home.xml` con t-call.** Files: `views/pages/home.xml`; modify manifest. Ref: spec §5. Acceptance: template `page_home` hereda `website.layout` y en `main` hace `t-call` de los 9 snippets en orden funnel: hero → pilares → sectores → contador+timeline (una sola sección) → caso_exito → equipo → cta_kit_consulting → cta_contacto. Cada `t-call` pasa parámetros (claim hero, archetype_id caso_exito). Deps: 4.1, Phase 3.

**4.3 — `data/config_parameters.xml` featured_archetype_id.** Files: `data/config_parameters.xml`; modify manifest. Ref: D3. Acceptance: `<record model="ir.config_parameter">` con `key='website_avanzosc_demo.featured_archetype_id'`, `value='1'`. Verificable: home muestra archetype 1. Deps: 4.2. **Bloqueo:** [?] #7 spec (default final).

**4.4 — Verificación + smoke + gate.** Files: PNGs en `snapshots/04-home/`. Acceptance: home `/` y `/eu/` en 375×667, 768×1024, 1280×800. Las 8 secciones en orden, animaciones disparan, sin roturas, switcher mantiene página equivalente. Smoke. Gate. Deps: 4.3.

---

## Phase 5 — Páginas sectoriales (4)

Estructura común D1: hero sectorial → subsectores QWeb estático → sector_specifics → caso_exito filtrado → cta_contacto.

**5.1 — `industrial.xml` ES + EU + payload.** Files: `views/pages/industrial.xml`; modify `data/website_pages.xml` (ES `/industrial`, EU `/eu/industriala`), manifest. Ref: spec §7, D1, D2. Acceptance: estructura D1. (1) hero claim sectorial «Odoo industrial real para fabricantes». (2) Subsectores estáticos: fabricación, química, alimentaria, mecanizado, textil (5 con icono Lucide). (3) sector_specifics payload `title='Tipos de fabricación que cubrimos'`, `items=['discreta','por procesos','MRP por capacidad','OEE','trazabilidad lote/serie']`. (4) caso_exito `archetype_id=1` configurable vía `featured_archetypes_industrial`. (5) cta_contacto. EU borrador con marcador. Deps: Phase 4.

**5.2 — `distribucion.xml` ES + EU + payload.** Análogo. Slug EU `/eu/banaketa`. Subsectores: retail, ecommerce, mayoristas. sector_specifics `title='Integraciones logísticas'`, `items=['transportistas (SEUR/MRW/...)','marketplaces (Amazon/eBay)','EDI con cadenas']`. Archetype default 5. Deps: 5.1.

**5.3 — `servicios.xml` ES + EU + payload.** Análogo. Slug EU `/eu/zerbitzuak`. Subsectores: IT, SAT, despachos. sector_specifics `title='Gestión de proyectos y partes de horas'`, `items=['project','hr_timesheet','facturación por hora/proyecto','helpdesk con SLA']`. Archetype default 7. Deps: 5.1.

**5.4 — `academias.xml` ES + EU + payload.** Análogo. Slug EU `/eu/akademiak`. Subsectores: escuelas, FP, academias privadas. sector_specifics `title='Comunicación con familias'`, `items=['portal padres/madres','notificaciones automáticas','calendario académico','pagos online']`. Archetype default 8. Deps: 5.1.

**5.5 — featured_archetypes_<sector> en config_parameters.** Files: modify `data/config_parameters.xml`. Ref: D3 extendido. Acceptance: 4 nuevos params: `featured_archetypes_industrial='1,2'`, `featured_archetypes_distribucion='5,6'`, `featured_archetypes_servicios='7'`, `featured_archetypes_academias='8'`. Sectoriales filtran caso_exito leyéndolos. Deps: 5.4.

**5.6 — Verificación + smoke + gate.** Files: PNGs en `snapshots/05-sectoriales/`. Acceptance: 4 sectoriales × 2 idiomas en 1280×800. Estructura D1 visible, payload correcto, archetype filtrado correcto, slug EU presente. Smoke. Gate. Deps: 5.5.

---

## Phase 6 — Estáticas restantes + 3 legales

7 páginas: conócenos, trabaja_con_nosotros, contacto, kit_consulting (ES-only), aviso_legal, politica_privacidad, politica_cookies.

**6.1 — `conocenos.xml` ES + EU.** Files: `views/pages/conocenos.xml`; modify website_pages.xml + manifest. Ref: CLAUDE.md §2. Acceptance: misión, valores 3-4, historia breve (referencia timeline home), referencia equipo. EU borrador con marcador, slug EU propuesto `/eu/ezagutu-gaitzazu`. Deps: Phase 5. **Bloqueo:** [?] #1 spec.

**6.2 — `trabaja_con_nosotros.xml` ES + EU.** Acceptance: por qué Avanzosc, vacantes (placeholder «consulta vacantes abiertas»), tipo de equipo, contacto carrera. EU borrador. Slug EU `/eu/lan-egin-gurekin`. Deps: 6.1. **Bloqueo:** [?] #1 spec.

**6.3 — `contacto.xml` ES + EU.** Acceptance: form completo (extiende cta_contacto con campos sector + presupuesto), tel, email, dirección, **mapa OpenStreetMap iframe** (NO Google Maps por GDPR). Slug EU `/eu/kontaktua`. Deps: 6.1. **Bloqueo:** [?] #1 spec.

**6.4 — `kit_consulting.xml` ES-only.** Acceptance: hero claim del programa Red.es Kit Consulting, descripción, requisitos elegibilidad, formulario consulta. **NO crear versión EU** (D5). Deps: 6.1.

**6.5 — `legal_aviso.xml` ES + EU.** Files: `views/pages/legal_aviso.xml`; modify website_pages.xml. Ref: Q3. Acceptance: titular Avanzosc S.L., CIF B20875340, dirección, contacto, finalidad, condiciones de uso, jurisdicción Tribunales Azkoitia/Donostia, propiedad intelectual. Texto basado en plantilla estándar S.L. española (NO copiado literal). Slugs `/aviso-legal` y `/eu/lege-oharra`. EU borrador completo con marcador. Deps: 6.1. **Bloqueo:** revisión asesoría legal antes de switchover (Q3 gate).

**6.6 — `legal_privacidad.xml` ES + EU.** Acceptance: política RGPD/LOPDGDD: responsable (Avanzosc), DPO si aplica, datos recogidos (form contacto: nombre/email/empresa/mensaje), finalidad (atención comercial), base legal (consentimiento + interés legítimo), conservación (12 meses tras último contacto), destinatarios (no se ceden), derechos ARCO+ y forma de ejercerlos. Slugs `/politica-de-privacidad` y `/eu/pribatutasun-politika`. EU borrador con marcador. Deps: 6.1. **Bloqueo:** asesoría legal.

**6.7 — `legal_cookies.xml` ES + EU.** Acceptance: versión «sólo cookies técnicas y de sesión Odoo, sin tracking». Lista las 3-4 cookies Odoo default (`session_id`, `frontend_lang`, etc.). Frase explícita: «Si en el futuro se incorpora una herramienta de analítica, esta página se actualizará y se solicitará consentimiento previo». Slugs `/politica-de-cookies` y `/eu/cookien-politika`. EU borrador. Deps: 6.1. **Bloqueos:** asesoría legal; [?] #4 spec (al decidir analytics, actualizar texto).

**6.8 — Verificar links footer legales.** Acceptance: los 3 links del footer (de tarea 1.5) ahora resuelven 200 con contenido. Idem en `/eu/`. Deps: 6.5, 6.6, 6.7.

**6.9 — Verificación + smoke + gate.** Files: PNGs en `snapshots/06-estaticas/`. Acceptance: 7 páginas × idiomas aplicables en 1280×800. Smoke. Gate. Deps: 6.8.

---

## Phase 7 — Header mobile (<992px)

**7.1 — SCSS hamburger <992px.** Files: modify `_header.scss`. Ref: spec §8.1 «Mobile breakpoint». Acceptance: en `<992px` menú principal `display: none`, hamburger Lucide `menu` 32×32 visible. Logo e icono usuario permanecen. Deps: Phase 6.

**7.2 — Overlay mobile + JS toggle.** Files: modify `views/layout.xml`, `_header.scss`, `static/src/js/snippets/header.js`. Ref: spec §8.1. Acceptance: click hamburger → overlay `position: fixed; inset: 0;` fondo `--neutral-0`, fade 200ms (sólo opacity). Overlay: menú vertical 7 items, sub-sectoriales como acordeón, switcher ES|EU dentro. Click link cierra overlay y navega. Deps: 7.1.

**7.3 — Acceso clientes mobile como icono Lucide user.** Files: modify `views/layout.xml`, `_header.scss`. Ref: spec §8.1. Acceptance: en `<992px`, botón = `<i data-lucide="user">` 32×32 con `aria-label="Acceso clientes"`, link a `/web/login`. Visible en barra junto al hamburger. Deps: 7.1. **Bloqueo:** [?] #2 spec.

**7.4 — Verificación + smoke + gate.** Files: PNGs en `snapshots/07-mobile/`. Acceptance: home en 375×667, 768×1024, 1280×800. 375 y 768: hamburger visible, menú oculto, icono user visible, click hamburger abre overlay. 1280: menú completo, hamburger oculto, botón con texto. Smoke. Gate. Deps: 7.3.

---

## Phase 8 — Animaciones y refinamiento

**8.1 — Repaso timing y easings.** Files: revisar JS de cada snippet animado. Ref: spec §9.2, CLAUDE.md §5. Acceptance: timings al ms y easings exactos (300-600ms micro, 800-1200ms entradas grandes; ease-out expo `cubic-bezier(0.16,1,0.3,1)`). Diferencias justificadas con comentario inline. Deps: Phase 7.

**8.2 — Verificación prefers-reduced-motion.** Files: ninguno; Playwright `emulate({reducedMotion:'reduce'})`. Ref: CLAUDE.md §5. Acceptance: con reduced-motion los 10 snippets en estado final inmediato; Lenis no se inicia; GSAP timelines no se disparan. Deps: 8.1.

**8.3 — Performance solo transform/opacity.** Files: ninguno. Ref: CLAUDE.md §5. Acceptance: DevTools Performance Record durante scroll completo home — sólo transform y opacity activan composite. Si una animación dispara reflow, refactorizar. Deps: 8.2.

**8.4 — Smoke + gate.** Deps: 8.3.

---

## Phase 9 — QA bilingüe ES/EU

**9.1 — Páginas ES en 3 viewports.** Files: PNGs en `snapshots/09-qa-es/`. Acceptance: 12 páginas (home + 4 sectoriales + 4 corporativas + 3 legales) × 3 viewports (375/768/1280) = 36 screenshots. Sin roturas, sin solapado, sin overflow horizontal. Deps: Phase 8.

**9.2 — Páginas EU en 3 viewports.** Files: `snapshots/09-qa-eu/`. Acceptance: equivalente para `/eu/*`. Excepción kit_consulting (ES-only D5). Deps: 9.1.

**9.3 — Switcher ES↔EU mantiene equivalente.** Acceptance: desde cada página ES, click EU → página equivalente con slug traducido (no `/eu/` raíz). Inverso idem. Excepción `/kit-consulting` (D5 — switcher desactivado o redirige a `/`). Deps: 9.2.

**9.4 — Verificar 12 redirects 301.** Acceptance: cada `url_from` → `curl -sI` devuelve 301 + Location correcto. Las filas comentadas TODO no son obligatorias hasta resolver. Deps: 9.3.

**9.5 — GATE switchover: NO TRANSLATION DRAFT.** Acceptance: `grep -rn "TRANSLATION DRAFT" data/ views/ static/` devuelve **0**. Si >0, listar al equipo Avanzosc para revisión lingüística. **Bloqueante para Phase 10.** Deps: 9.4.

**9.6 — Smoke final + gate.** Deps: 9.5.

---

## Phase 10 — Pre-switchover checklist

**10.1 — Sitemap.** Acceptance: `/sitemap.xml` lista 12 páginas ES + 11 EU (sin kit_consulting EU). URLs absolutas con dominio `nueva.avanzosc.es` durante QA. Deps: Phase 9.

**10.2 — robots.txt subdominio.** Files: `static/src/robots/robots.txt`. Ref: spec §12.1, D6. Acceptance: `User-agent: *\nDisallow: /` durante QA. **Eliminar antes del switchover** al dominio principal. Deps: 10.1.

**10.3 — Auditoría SEO previa.** Files: `docs/superpowers/plans/audit-seo-pre-switchover.md`. Ref: spec §11, D6. Acceptance: Screaming Frog (o equivalente) sobre `https://avanzosc.es` actual. Listar URLs con tráfico. Comparar contra 12 redirects. Identificar gaps. Resolver mapping de URLs no contempladas. Deps: 10.2. **Resuelve:** [?] #5 spec (`/blog/*`); [?] #6 spec (`/kit-digital`).

**10.4 — Resolver bloqueos blandos restantes.** Acceptance: las 8 `[?]` cerradas o documentadas con plan post-switchover. Cada resolución aplicada al código antes del switchover (logo SVG, hex finales, URL portal, slugs EU validados, analytics si se decide). Deps: 10.3.

**10.5 — Switchover runbook.** Files: `docs/superpowers/plans/switchover-runbook.md`. Ref: spec §12.2. Acceptance: 7 pasos del spec §12.2 con comandos exactos + paso revisión legal Q3 + eliminación robots Disallow + notificación Google Search Console + monitor 404s 30 días post-switchover. Deps: 10.4.

**10.6 — GATE final humano para switchover.** Acceptance: usuario revisa runbook + estado 8 bloqueos + screenshots QA. OK explícito. **Switchover en sí FUERA de v1** (operación de despliegue). Deps: 10.5.

---

## Bloqueos blandos asignados

| `[?]` spec §13 | Tarea(s) | Bloqueante para |
|---|---|---|
| #1 EU slugs/trad no sectoriales | 2.2, 6.1, 6.2, 6.3 | 9.5 → switchover |
| #2 URL Acceso clientes | 1.2, 7.3 | switchover |
| #3 Logo hex + SVG | 0.5, 1.2 | switchover |
| #4 Analytics | 6.7, 10.4 | switchover si se decide |
| #5 `/blog/*` | 2.3, 10.3 | switchover |
| #6 `/kit-digital` antiguo | 2.3, 10.3 | switchover |
| #7 Archetype default home | 4.3 | NO bloqueante (default 1) |
| #8 Sesión fotográfica | 3.9, 10.4 | NO bloqueante (placeholders en v1) |

**Gates de sesión adicionales:**
- **Q1** (TRANSLATION DRAFT marcadores): 9.5, bloqueante switchover.
- **Q3** (revisión legal 3 páginas): 6.5/6.6/6.7, bloqueante switchover.

---

## Notas operativas

- Commits no se planifican; usuario decide.
- Push: nunca sin autorización explícita en sesión actual (CLAUDE.md línea 1).
- MCPs: Playwright (verificación visual), context7 (docs GSAP/Lenis/Splitting/Bootstrap 5/Odoo 14), fs-addons, odoo (BD `odoo14_community`).
- Working dir: `/opt/odoo/v14/workspace/website_avanzosc_demo`.
- Smoke obligatorio al final de cada fase.
- Gate humano al final de cada fase: usuario revisa screenshots + diff y aprueba antes de la siguiente.
