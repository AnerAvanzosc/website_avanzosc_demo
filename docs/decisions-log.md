# Log de decisiones — `website_avanzosc_demo`

Este archivo es la fuente íntegra de decisiones tomadas durante el proyecto. `CLAUDE.md` §11 mantiene una tabla resumen con 1 línea por decisión y enlace a este documento. Las anclas `<a id="…"/>` permiten linkar directo a cada entrada.

Estructura:

1. **Pre-spec** — decisiones del brainstorm inicial (sesión 2026-04-27 antes de la revisión del design spec). Sin ID `Dx`.
2. **Spec review (D1–D6)** — sesión 2026-04-27 de revisión del design spec.
3. **Phase 1 implementation (D7–D10)** — descubrimientos y formalizaciones durante la implementación.
4. **Diferidos resueltos** — notas de cierre de decisiones que quedaron pendientes y se cerraron al ejecutarse.

---

## 1. Pre-spec — decisiones del brainstorm inicial

<a id="pre-modules"></a>
### Módulos website-* a instalar

`website`, `website_sale`, `website_slides`. `portal`, `mail` y `web_editor` entran como dependencias automáticas. **Ya instalados en `odoo14_community`.**

`website_blog` quedó instalado en BD de la ronda anterior pero NO se declara en `depends` de `website_avanzosc_demo`. Queda residual e invisible al no tener menú ni enlaces; si en v2 se decide retomar el canal, basta con reactivar.

<a id="pre-arch"></a>
### Arquitectura

Todo dentro del mismo Odoo, tema custom sobre `website`.

<a id="pre-name"></a>
### Nombre del módulo

`website_avanzosc_demo`.

<a id="pre-repo"></a>
### Repo y ruta (fase experimental)

`github.com/AnerAvanzosc/website_avanzosc_demo`, working dir `/opt/odoo/v14/workspace/website_avanzosc_demo`. El repo oficial `github.com/avanzosc/odoo-addons` NO se toca durante esta fase.

<a id="pre-langs"></a>
### Idiomas

ES + EU. `website.language_ids = [es_ES, eu_ES]`, URL raíz ES (sin prefijo) + `/eu/`. Páginas corporativas fijas en los 2 idiomas; casos de éxito y contenidos largos pueden arrancar ES-only con traducción progresiva. **Validación**: turno del usuario (2026-04-27) tras presentar A/B/C/D: «hagamos el B».

<a id="pre-claim"></a>
### Claim de la home

«Odoo industrial de verdad, desde 2008.» (opción B de §9.1 de CLAUDE.md). EU: «Benetako Odoo industriala, 2008tik.». Encaja con SplitText sin sobrepasar 800ms y con tono §9.2 (frases cortas, cero palabrería). El activo "17 años" se traslada al contador animado y/o timeline en lugar de aparecer en el H1. **Validación**: turno del usuario (2026-04-27) tras presentar A/B/C/D: «b».

<a id="pre-home"></a>
### Estructura de la home

8 secciones visuales en orden funnel B2B (Approach B), con 9 snippets QWeb:

1. Hero (claim + 2 CTAs) — `s_avanzosc_hero`.
2. Tres pilares (Desde 2008 / 600+ módulos OCA / Equipo STEM) — `s_avanzosc_pilares`.
3. Grid de sectores (Industrial · Distribución · Servicios · Academias) — `s_avanzosc_sectores`.
4. Trayectoria + volumen (bloque combinado): `s_avanzosc_contador` (600+) sobre `s_avanzosc_timeline` (hitos 2008→hoy de §9.1).
5. Caso de éxito destacado — `s_avanzosc_caso_exito`.
6. Equipo (fotos reales + titulación + especialidad) — `s_avanzosc_equipo`.
7. CTA Kit Consulting — `s_avanzosc_cta_kit_consulting`.
8. CTA contacto final (teléfono + email + botón) — `s_avanzosc_cta_contacto`.

**Snippets nuevos a crear** (ya añadidos a §8 CLAUDE.md): `s_avanzosc_pilares`, `s_avanzosc_cta_contacto`.
**Validación**: turno del usuario (2026-04-27) tras presentar A/B/C: «b».

<a id="pre-cases"></a>
### Casos de éxito destacados

Catálogo inicial de 8 archetypes anónimos (sin nombres reales, sin fotos reales, sin métricas reales — Avanzosc aún no tiene los datos consolidados). Cobertura por sector:

1. Industrial — fabricante metalúrgico/mecanizado exportador (MRP por capacidad, configurador multivariante, aduanas, multidivisa).
2. Industrial — química con trazabilidad batch + ADR (lotes, vencimientos, fichas de seguridad, SILICIE).
3. Industrial — alimentaria con AECOC + balanzas (trazabilidad lote, alérgenos, integración con balanzas de envasado).
4. Industrial — textil con temporadas y OEMs (PV/OI, variantes talla-color, producción para terceros).
5. Distribución — cadena retail multitienda + ecommerce (POS multitienda, sync ecommerce, multialmacén, devoluciones omnicanal).
6. Distribución — mayorista con catálogo 50.000+ referencias (configurador, listas de precios por cliente, EDI, packs).
7. Servicios — IT/SAT con técnicos en ruta (helpdesk, planning geolocalizado, SLA, facturación recurrente).
8. Academias — grupo educativo multicentro (matriculación online, gestión académica multicentro, pagos, comunicación con familias).

**Implicaciones para snippets**: `s_avanzosc_caso_exito` debe diseñarse anonymous-first — sin logo, sin nombre, con visuales placeholder (capturas anonimizadas de dashboards Odoo o ilustraciones abstractas, **nunca stock photos** per §9.6) y sin métricas inventadas. Cuando se consigan permisos, un caso pasa de anónimo a nombrado sin tocar la estructura del snippet.
**Validación**: turno del usuario (2026-04-27) tras presentar A/B/C/D/E: «lo que recomiendes, pero por ahora que sea generico en cuanto a nombres fotos y datos, ya que no tengo ni yo los datos» → confirma los 8 (Approach A) y reafirma anonimato total para la fase actual.

<a id="pre-blog"></a>
### Blog

FUERA del sitio. `website_blog` NO se añade a `depends` de `website_avanzosc_demo`. Ni menú, ni link, ni snippet en home. El módulo `website_blog` queda residual en BD (instalado por ronda anterior) pero invisible al visitante. Reversible: el día que Avanzosc decida activar el canal con persona dedicada, basta con añadir el módulo a `depends` y estilizar plantillas. **Validación**: turno del usuario (2026-04-27) tras presentar A/B/C: «no quiero blogs, fuera fuear».

<a id="pre-legal"></a>
### Datos legales del footer (vigentes)

Confirmados en sesión 2026-04-27. CIF B20875340 · Av. Julio Urkijo 34 bajo, 20720 Azkoitia, Gipuzkoa · Tel 943 026 902 · Email comercial@avanzosc.es. (Antes en "Decisiones pendientes" — confirmados literalmente por el usuario en la sesión de revisión del spec).

---

## 2. Spec review (D1–D6) — sesión 2026-04-27

Las 6 decisiones siguientes se cerraron en la sesión de revisión del spec, posterior al brainstorm original. Detalle técnico completo en `docs/superpowers/specs/2026-04-27-website-avanzosc-demo-design.md` §2.

<a id="d1"></a>
### D1 — Estructura común de páginas sectoriales

Cada sectorial sigue el patrón `hero sectorial · subsectores (QWeb estático) · s_avanzosc_sector_specifics · 1-2 archetypes filtrados · s_avanzosc_cta_contacto`. Bloque propio por sector: industrial→tipos de fabricación, distribución→integraciones logísticas, servicios→gestión de proyectos, academias→comunicación con familias. **Snippet nuevo añadido** a §8 CLAUDE.md: `sector_specifics.xml`. **Validación**: turno del usuario (2026-04-27) en revisión del spec: «Sectoriales — patrón común con bloque específico por sector. Estructura base como propones (hero + subsectores + archetypes filtrados + CTA), añadiendo un bloque propio a mitad de página por sectorial […]».

<a id="d2"></a>
### D2 — Slugs URL EU traducidos al euskera

Bajo `/eu/`, los 4 slugs sectoriales son `/eu/industriala/`, `/eu/banaketa/`, `/eu/zerbitzuak/`, `/eu/akademiak/`. Slugs no sectoriales (conócenos, contacto, etc.) pendientes de validación lingüística por equipo Avanzosc — listados en preg. abierta del spec. **Validación**: turno del usuario (2026-04-27): «Slugs traducidos al euskera bajo /eu/. /eu/industriala/, /eu/banaketa/, /eu/zerbitzuak/, /eu/akademiak/».

<a id="d3"></a>
### D3 — Caso de éxito en home — selección configurable

Uno fijo, seleccionado vía `ir.config_parameter` `website_avanzosc_demo.featured_archetype_id`. Mismo patrón aplicable a sectoriales (`featured_archetypes_<sector>`). **Validación**: turno del usuario (2026-04-27): «Caso de éxito en home: uno fijo configurable vía ir.config_parameter. Aprobada tu propuesta».

<a id="d4"></a>
### D4 — Snippets fuera del Website Builder

Los 10 snippets v1 NO se registran en el builder. Sólo `<t t-call="…"/>` desde home y páginas. Coherente con §10 ("todo por código, no tocar el builder"). Cualquier apertura futura a drag&drop requiere decisión explícita. **Validación**: turno del usuario (2026-04-27): «Snippets: solo includes XML, NO registrados en el builder. Coherente con CLAUDE.md §10 […]. Si en v2 se decide habilitar drag & drop en builder, se registran entonces — esa puerta requiere decisión futura explícita, no se abre por defecto».

<a id="d5"></a>
### D5 — `/kit-consulting` ES-only

La landing del programa Red.es queda monolingüe en castellano por naturaleza temporal y audiencia hispanohablante. **Validación**: turno del usuario (2026-04-27): «/kit-consulting en ES-only. Aprobada. Programa estatal, audiencia hispanohablante, contenido temporal».

<a id="d6"></a>
### D6 — Convivencia temporal y switchover

La web nueva vive en `nueva.avanzosc.es` durante desarrollo y QA, sobre el **mismo Odoo `odoo14_community`** con un `website` adicional (decisión de la propia sesión de revisión del spec — descartada la opción "Odoo separado"). Switchover al dominio principal con redirects 301 desde URLs antiguas; mapeo concreto en design spec §11. No mapeo exhaustivo de artículos de blog. **Validación**: turno del usuario (2026-04-27): «Convivencia temporal en subdominio + switchover planificado. Web nueva vive en nueva.avanzosc.es durante desarrollo y QA. Cuando esté validada, switchover al dominio principal con redirects 301 desde URLs antiguas para no perder SEO acumulado».

---

## 3. Phase 1 implementation (D7–D10)

<a id="d7"></a>
### D7 — Setup de menús vía `post_init_hook` Python

El XML data declarativo NO funciona para sub-jerarquías de menú en Odoo 14 multi-website. Concretamente: `Menu.create()` en `addons/website/models/website_menu.py:80-99` aplana `parent_id` al `top_menu` de cada website cuando crea las copias per-website desde `Default Main Menu`, ignorando el `parent_id` declarado. Solo respeta el parent si es exactamente `default_menu.id` (raíz). Por tanto, los 7 records top-level con `parent_id=ref(website.main_menu)` SÍ funcionan vía XML; pero los 4 hijos del dropdown «Soluciones sectoriales» (Industrial, Distribución, Servicios, Academias) requieren creación vía `post_init_hook` con `website_id` explícito en `vals` — eso hace que `Menu.create()` tome la primera rama (`if 'website_id' in vals`) que preserva `parent_id` correctamente. Hook idempotente (búsqueda por `name + parent_id + website_id` antes de crear) — múltiples `-u` no duplican. Trade-off aceptado: rompe la promesa «sin `models/` en v1» del spec §3.2 (ahora hay un `hooks.py` ligero), pero la alternativa (XML con búsqueda dinámica del Soluciones-en-website-N) era más frágil. **Validación**: descubierto durante implementación de Task 1.1, decisión de sesión 2026-04-28: «C.1 con cleanup manual». Detalle del bug arquitectural en commit `[REVERT] task 1.1 (c08f3ba)`. Implementación en commit `[FEAT] task 1.1 (C.1)`.

<a id="d8"></a>
### D8 — Cleanup de menús default Odoo vía `Menu.unlink()` cascade-by-URL

Al instalarse, los módulos `website_sale`, `website_blog` y `website_slides` siembran 4 top-level (`/shop`, `/blog`, `/slides`, `/contactus`) en cada website; queremos que SOLO sobrevivan los 7 nuestros (Inicio, Soluciones, Tienda, Formación, Conócenos, Trabaja, Contacto). El XML data NO puede borrar records ajenos (las copias per-website carecen de `xml_id` propio; solo los originales en Default Main Menu tienen los `xml_id` de core). Solución: aprovechar el comportamiento de `Menu.unlink()` en `addons/website/models/website_menu.py:105-113` — cuando se hace `unlink()` sobre un menu cuyo `parent_id == default_menu.id`, el ORM busca y unlinka también todos los `website.menu` con la misma URL y `website_id != False`. Los originales en Default Main Menu (con `website_id IS NULL`) NUNCA matchean ese filtro, por lo que se preservan junto con sus `xml_id` de core (`website.menu_contactus`, `website_sale.menu_shop`, `website_blog.menu_blog`, `website_slides.website_menu_slides`). Patrón: para cada URL a limpiar, crear un dummy bajo Default Main Menu con esa URL y unlinkarlo inmediatamente; el cascade barre todas las copias per-website. Idempotente (skip si no existe copia per-website). Implementado en `hooks.post_init_remove_odoo_defaults`, expuesto vía wrapper `_post_init_main` que también invoca `post_init_menu_hierarchy` (D7).

**Limitación estructural**: si en el futuro se ejecuta `-u <core_module>` aislado (por ejemplo `-u website_sale` sin actualizar simultáneamente `website_avanzosc_demo`), Odoo re-aplica el data file del core que re-crea las copias per-website de `/shop` (idem para `/blog`, `/slides`, `/contactus`). El `post_init_hook` NO se vuelve a disparar (solo en `-i`), por lo que las copias re-aparecen en el navbar. Mitigación operativa: actualizar siempre `website_avanzosc_demo` junto con cualquiera de `{website, website_sale, website_blog, website_slides}`. Si la re-aparición ocurre, basta con relanzar la lógica del cleanup vía `odoo-bin shell` (la función es idempotente y segura). **Validación**: descubierto al investigar la cascade durante el revert de Task 1.1 — Home (id=5) desapareció de website 1 cuando uninstalleamos el módulo, observación que reveló el matching por URL (`/`). Decisión de sesión 2026-04-28: «D8.A.2 con plan de ejecución de los 7 pasos». Implementación en commit `[FEAT] cleanup: remove default Odoo menus from website 1 via D8 cascade pattern`.

<a id="d9"></a>
### D9 — Estrategia i18n: ES como source en QWeb, traducciones EU vía `i18n/eu.po`, sin `.pot`

Spec D1 fija ES + EU como idiomas activos del sitio. Implementación canónica:

- **Source language**: castellano (`es_ES`) hardcoded en los nodos QWeb (e.g. `<h5>Soluciones</h5>`). Odoo extrae automáticamente el contenido textual de los nodos QWeb como traducible (default behavior — no hace falta atributo opt-in tipo `t-translate="on"`). Para neutralizar una string específica de la traducción, usar `t-translation="off"` en ese nodo.

- **Translations EU**: viven en `i18n/eu.po`. El archivo lo carga Odoo automáticamente en `-i` / `-u` desde el directorio `i18n/` (no se declara en `__manifest__.py['data']`, mismo patrón que core / OCA). Cada entrada se marca con flag `#, fuzzy` y un comentario `# DRAFT - REVIEW NEEDED` por encima — Q1 cerrada exige gate de revisión lingüística por equipo Avanzosc antes de levantar el flag fuzzy.

- **No usamos `.pot` template** en v1. La fuente canónica son los strings hardcoded en QWeb; `eu.po` se mantiene a mano. Trade-off aceptado: cuando Phase 1 cierre y la lista de strings sea estable, generar `.pot` vía `odoo-bin --i18n-export=...` y refrescar `eu.po` con `--i18n-overwrite` para alinear con la práctica OCA estándar (Phase 2 cleanup).

- **English no entra en v1**: `en_US` no está activo en `website.language_ids` (D1). Si en algún futuro se añade, requeriría `i18n/en.po`. Sin él, usuarios `en_US` verían el source ES literal — comportamiento aceptado per spec actual.

- **Strings que NO se traducen**: identificadores legales (CIF, dirección, razón social), URLs/slugs internos (incluso si la etiqueta visible cambia — D7-relacionado), datos numéricos. Se hardcodean idénticos en ambos idiomas.

**Validación**: implementado en Task 1.4 (footer 4-col bilingüe). Smoke 1.4 confirma carga de `i18n/eu.po`. Verificación visual a `/eu_ES/` rendea las 15 strings traducidas. Decisión de sesión 2026-04-28 tras review de Task 1.4.

<a id="d10"></a>
### D10 — Setup de idiomas vía operación imperativa + `post_init_hook`

(no `data/website_config.xml`). Spec D1 fija ES + EU como idiomas activos. En instalaciones fresh sobre BBDD nuevas, el `post_init_setup_languages` (en `hooks.py`, parte del wrapper `_post_init_main`) se encarga imperativamente de:

1. Activar `es_ES` y `eu_ES` en `res.lang` si no están activos. Búsqueda con `with_context(active_test=False)` para encontrar registros inactivos. Si el record no existe (lang no instalado), `env['res.lang'].load_lang(code)` lo crea.
2. Asegurar que `website.language_ids` del website id=1 incluya ambos langs vía `(4, lang.id)` (m2m union).
3. Asegurar que `website.default_lang_id` del website id=1 sea `es_ES` (write only si differs).

Idempotente: `write({'active': True})` es no-op si ya está True; m2m union no duplica; default_lang write solo se aplica si difiere. Re-runs vía shell o post_init son seguros.

**Por qué imperativo + hook en lugar de declarativo `data/website_config.xml`**:

- Coherencia con D7 (menú via hook) y D8 (cleanup defaults via hook): el resto de nuestro «setup operacional del website» ya vive en `hooks.py`. Una sola fuente para «cómo debe quedar el sitio tras instalar».
- Robustez: `<function model="res.lang" name="load_lang">` en XML data es frágil cuando el lang ya está parcialmente cargado (e.g. tras `-u` después de activación manual via shell). Requiere `noupdate=1` y manejo de excepciones. La búsqueda imperativa search-and-write aquí es idempotente sin esa fragilidad.
- Pre-existencia en BBDD productiva: en sesión 2026-04-28 (Task 1.2 round) se activó EU imperativamente vía `odoo-bin shell` antes de que existiera este hook. Aceptar esa activación retroactivamente y formalizar via hook para futuras instalaciones fresh.

**Limitación**: solo configura website id=1. Si el BBDD tuviera múltiples websites (no es el caso en v1), los demás conservarían su config. Aceptable per «single website» en v1.

**Validación**: implementado en Task 2.1 retroactiva (sesión 2026-04-28). El hook se invoca como primer paso del `_post_init_main` antes de `post_init_menu_hierarchy` y `post_init_remove_odoo_defaults`.

---

## 4. Diferidos resueltos

<a id="hero-deferred"></a>
### Decisiones diferidas a Task 3.10 hero — CERRADAS

Discovery hecho en sesión 2026-04-28 antes de ejecutar Phase 2; B-G se posponían hasta llegar a 3.10 con contexto acumulado de Phases 2 + 3.1-3.9. **Todas resueltas durante la implementación de Task 3.10** (sesión actual). Detalle de los valores finales en el commit `[FEAT] task 3.10: s_avanzosc_hero snippet (Splitting.js + GSAP timeline + 2 CTAs)` (`61f4808`) y en el plan §3.10. Propuestas iniciales que documentamos para releer en su momento:

- **B — Subtítulo del hero**: plan/spec no lo especifican. Propuesta: «Migración OpenUpgrade, módulos OCA y localización fiscal española. Para industria, distribución, servicios y academias.» (tono per CLAUDE.md §9.2).
- **C — Textos + URLs de los 2 CTAs**: plan lista los 6 parámetros pero sin defaults. Propuesta: CTA1 «Ver soluciones» → `#sectores` (anchor a sección 3 home) o `/industrial`; CTA2 «Hablar con nosotros» → `/contacto`.
- **D — Background del hero**: spec §5 dice «espacio negativo amplio» sin color. Propuesta: blanco (`--neutral-0`) con headline `--neutral-900` (máxima legibilidad; densidad reservada para timeline+contador per §9.8).
- **E — Imagen / SVG / illustration**: spec §9.6 prohíbe stock; CLAUDE.md §9.6 prefiere fotos reales del equipo o industriales. Sin sesión fotográfica ([?] #8 spec). Propuesta: **sin imagen en v1** (solo H1 + subtítulo + 2 CTAs sobre fondo limpio); reversible al cerrar [?] #8.
- **F — Altura del hero**: spec sin valor. Propuesta: `min-height: 600px` con padding generoso; NO 100vh (rompe scroll natural y choca con sticky header).
- **G — Animación inicial**: plan 3.10 la lista como acceptance, pero teóricamente diferible. Propuesta: **NO diferir** — la entrada letra-por-letra es el «moment of arrival» diferenciador. Implementar completo en 3.10.

Estado: Task 3.10 cerrada — la verdad final del hero vive en `views/snippets/hero.xml`, `static/src/scss/snippets/_hero.scss` y `static/src/js/snippets/hero.js`.

---

## 5. Post-v1 polish (D11–D20)

Sesión 2026-04-29 / 2026-04-30 tras cierre técnico de v1: dos sub-bloques de polish (A: transiciones suaves, B: rediseño /contacto) más una iteración (A6: latencia page transition). Todas las decisiones de esta sección se tomaron post-validación visual humana de v1. Commits originales en branch `feature/v1-implementation` rango `e6f9b10..644d8fe`.

<a id="d11"></a>
### D11 — Lenis 1.0.42 sin built-in `anchors`: listener manual delegado

Lenis 1.0.42 NO expone la opción `anchors` del constructor. Verificado contra `cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js` — solo expone `scrollTo`. Context7 mostraba docs sin pin de versión que reflejaban una release posterior; **lección operacional: verificar API contra el CDN exacto pinado en `views/assets.xml`, no contra docs sin versión**.

Implementación: listener delegado en `document` para clicks `<a href="#…">` same-page que llama `lenis.scrollTo(target, opts)` con offset numérico, history.pushState para URL compartible. Vive en `static/src/js/main.js` dentro de `AvanzoscRoot.start()`. **Validación**: commit `7a48d9b` [FEAT] post-v1: smooth anchor scroll via Lenis with header offset.

<a id="d12"></a>
### D12 — Compensación bias residual ~+16 px de Lenis scrollTo

`lenis.scrollTo(target, {offset})` con target elemento o numérico añade un sesgo residual de ~+16 px al scrollTop final (medido empíricamente en /contacto, /industrial, /equipo cross-page). No calibrable a cero. **Compensación**: cálculo numérico del target (`el.offsetTop - HEADER_OFFSET`) en lugar de delegar a Lenis con elemento+offset. La fórmula final: `offset = headerHeight + 20` (breathing) — el +20 absorbe el bias y deja clearance final consistente de ~20 px sobre el header.

**Validación**: commits `7a48d9b` [FEAT] (versión inicial offset fijo 80) + `8a38705` [FIX] post-v1: dynamic header offset (versión final dinámica per D13).

<a id="d13"></a>
### D13 — Header height dinámico (no offset fijo) para anchor scroll

Header en EU mide ~100 px en viewport 1280×720 (navbar wrap por etiquetas más largas tipo «Lan egin gurekin», «Ezagutu gaitzazu»). En ES con mismo viewport el header puede medir 62 px scrolled o 100 px no scrolled según estado. **Un offset fijo de 80 px dejaba el target tras el header en EU** (overlap de 36 px detectado en verificación final del sub-bloque A).

**Solución**: leer `header.offsetHeight` al click time, calcular `offset = headerHeight + 20`. Auto-adaptable a cualquier idioma/viewport sin tocar código. **Validación**: commit `8a38705` [FIX] post-v1: dynamic header offset for anchor scroll (taller EU navbar).

<a id="d14"></a>
### D14 — Detección de home robusta entre ES y EU

`request.httprequest.path` en Odoo 14 con lang routing puede llegar lang-stripped (`/`) o lang-literal (`/eu_ES/`) según el flujo de routing. Una comparación naïve `path == url_for('/')` falla en EU.

**Solución**: comparación dual `is_home = path == '/' or path == url_for('/')`. Cubre ambas formas. Aplicado en `cta_contacto.xml` para enrutar `#timeline` (same-page en home) vs `/#timeline` o `/eu_ES/#timeline` (cross-page con lang preservado). **Validación**: commit `bd63b75` [FIX] post-v1: cta_contacto secondary URL routes to /#timeline when not on home.

<a id="d15"></a>
### D15 — `publicWidget` con `selector: 'body'` no auto-instancia: enganchar a `AvanzoscRoot.start()`

Verificado empíricamente en sesión 2026-04-29: un `publicWidget.Widget.extend({selector: 'body', start: …})` registrado vía `odoo.define` NO se auto-instancia en este módulo. La función `start()` nunca se ejecuta (instrumentado con `console.log` y `window.__flag`). Razón exacta no investigada (ver §6 «Decisiones diferidas»). **Workaround**: enganchar listeners globales a `AvanzoscRoot.start()` (selector `#wrap`, sí funciona).

Aplicado en page transition fade overlay listener (sub-bloque A commit `e9d7f37`) y en cualquier listener global futuro. **Lección operacional: preferir selectores específicos del snippet o engancharse a AvanzoscRoot, evitar selectores demasiado genéricos**.

<a id="d16"></a>
### D16 — Honeypot pattern: `position:absolute` + `clip-path`, no `display:none`

Algunos crawlers/bots detectan campos con `display: none` o `visibility: hidden` y skip-fillan (no caen en el honeypot). El patrón estándar a11y-compliant que sí captura bots:

```scss
.honeypot {
    position: absolute;
    left: -9999px;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
}
```

Combinado con `aria-hidden="true"` y `tabindex="-1"` el campo es invisible visualmente, fuera del flujo de teclado, ignorado por screen readers, pero presente en el DOM y rellenable por bots automáticos. **Validación**: aplicado en `s_avanzosc_contacto_form` campo `name="website"`, commit `04484ac` [FEAT] post-v1: rediseño /contacto.

<a id="d17"></a>
### D17 — Páginas accesibles solo vía redirect: `is_published=True` + `website_indexed=False`

Para páginas que solo son accesibles tras una acción (como `/contacto/gracias` tras submit del form): `is_published=True` (necesario para que el redirect 303 del controller resuelva 200) + `website_indexed=False` (evita que Google indexe la confirmación; sin valor SEO, ruido en SERP). **Validación**: aplicado en `page_contacto_gracias_record`, commit `d1c0d9d` [FEAT] post-v1: backend handler /contacto/submit + /gracias.

<a id="d18"></a>
### D18 — Form action y redirect lang-aware en website-routed controllers

En Odoo 14 con `@http.route(..., website=True, multilang=True)` (default) el form action que renderiza QWeb construye automáticamente el prefijo de lang: `/contacto/submit` en ES, `/eu_ES/contacto/submit` en EU. **El controller debe detectar lang via `request.lang.code` y construir el redirect lang-aware** (no asumir `/contacto/gracias` literal):

```python
def _gracias_url(self):
    if request.lang and request.lang.code != 'es_ES':
        return '/' + request.lang.url_code + '/contacto/gracias'
    return '/contacto/gracias'
```

**Validación**: `WebsiteAvanzoscContact._gracias_url`, commit `d1c0d9d`. Verificado empíricamente: form en /eu_ES/contacto → submit → 303 a `/eu_ES/contacto/gracias` (lang preservado).

<a id="d19"></a>
### D19 — Propuesta A («invertir SCSS opacity por gsap.set en JS») descartada por FOFC en stack lazy

Diagnóstico latencia page transition (sesión 2026-04-30): mediciones Playwright confirmaron TTFB ~25 ms y load ~80 ms (rapidísimo) — el cuello no es server-render ni network. Es **el gap entre primer paint del destino y el momento en que `publicWidget._startWidgets` instancia los widgets que revelan el hero** (animaciones GSAP). Lazy bundle Odoo (`assets_common_lazy.js` 1241 KB + `assets_frontend_lazy.js` 346 KB) carga post-`loadEventEnd`; widget `start()` corre típicamente 70-150 ms tras el primer paint.

**Propuesta A literal** (invertir SCSS de `opacity:0` a `opacity:1` por default + `gsap.set(el, {opacity:0})` en JS antes de animar) **NO aplicable** en este stack: el `gsap.set` llega 70-150 ms tras el primer paint del destino. Resultado visual: hero VISIBLE estático → SNAP a invisible (gsap.set) → fade-in animado (timeline). Un Flash Of Final Content (FOFC) seguido de salto a invisible — peor que el estado actual («hero invisible una vez hasta anim»).

El comentario inline ya existente en `_contacto.scss:31` («Si JS no carga, el SCSS @reduced-motion (abajo) revela el claim») confirma que el equipo previo ya consideró este trade-off: **el patrón actual (invisible hasta JS) es deliberado, con `prefers-reduced-motion` como escape valve para usuarios con la preferencia activada**. Invertir descarta ese diseño sin resolver el cuello.

**Validación**: STOP-and-report del orquestador. No se modificó código bajo Propuesta A. Diagnóstico completo en branch session log; iteración alternativa en D20.

<a id="d20"></a>
### D20 — Page transition fade recortado 200→100 ms (Propuesta D); B diferida con criterio de reapertura

Tras descartar A (D19), iteración LOW-cost: **recortar la duración del fade page transition** para que el overlay desaparezca antes de generar la expectativa «transición completa, ya estoy» seguida del blanco residual durante el JS lazy parse. Con fade más corto la transición se siente como una carga normal del browser que el usuario ya tolera, sin inducir frustración por blanco residual.

**Cambios**:
- `_page_transition.scss`: `transition: opacity 100ms` (antes 200ms).
- `main.js`: `setTimeout(…, 90)` antes de `window.location.href` (antes 200).
- Offset intencional 10 ms: nav fire ~10 ms antes del fin del fade para que el render del destino empiece bajo el final del overlay sin gap blanco.

**Sitio canónico repartido en 2 ficheros (intencional)**: SCSS controla duración del fade-in; JS controla cuándo dispara la nav. Son timings distintos. Si en futuro hace falta unificarlos, exponer `--page-transition-duration` CSS custom property y leerlo desde JS via `getComputedStyle(document.documentElement).getPropertyValue(...)`.

**Validación**: commit `644d8fe` [IMP] post-v1: shorten page transition fade from 210ms to 100ms. Validación visual humana aprobada post-push.

**Propuesta B (hold overlay until JS ready) — diferida con criterio de reapertura**: si tras switchover a producción real el TTFB resulta >300 ms (medible vía `curl -w '%{time_starttransfer}\n'` contra `https://avanzosc.es/`), la latencia se hace dominante en server-render y no en JS init; en ese caso D20 es insuficiente y B reabre como segunda iteración. La condición de reapertura: **mediciones reales en producción tras switchover, no localhost**.

<a id="d21"></a>
### D21 — Q5/Q6 cerrados: redirects 301 legacy avanzosc.es

Sesión 2026-04-30 tras inventario empírico de avanzosc.es legacy:

**Q5 — `/blog/*` redirects**:
- avanzosc.es legacy tiene 16 URLs `/blog*` indexadas en sitemap.xml (1 categoría `/blog/odoo-1` + 14 artículos `/blog/odoo-1/<slug>` + `/blog/odoo-1/feed`). ES-only (no `/eu*` legacy verificado curl).
- Decisión: 301 a `/` (lang-aware). El blog v1 está fuera del sitio per D pre-spec «Blog» — todas las URLs blog redirigen a la home equivalente.
- Implementación: doble cobertura.
  - **Custom HTTP controller** `WebsiteAvanzoscBlogRedirect` en `controllers/main.py` cubre `/blog` raw + `/blog/<path:rest>` (3+ segments) lang-aware con 301 puro. Ruta lang-aware via `request.lang.code` (patrón D18).
  - **15 entries `website.rewrite`** en `data/redirects.xml` específicas para los URLs reales del sitemap legacy. Razón: `website_blog` (Odoo, instalado pero invisible per D pre-spec «Blog») tiene routes con converters específicos `<model('blog.blog')>/<model('blog.post')>` que hijack las URLs `/blog/<2 segments>` antes que el custom controller. Cuando esos lookups model fallan (slug `odoo-1` no existe como blog real en BD), Odoo cae a `_serve_redirect` que SÍ procesa los entries literales de website.rewrite.
- Por qué no `redirect_type=308` con `<path:rest>` werkzeug syntax: 308 emite status 308, no 301. Briefing exige 301 puro para coherencia SEO con resto de redirects del módulo.
- Trade-offs conocidos: 2 URLs sitemap específicas (`/blog/odoo-1`, `/blog/odoo-1/feed`) hacen hop intermedio a `/blog/travel-1*` (blog default Odoo demo) por hijack pre-_serve_redirect; URLs no críticas (categoría + feed RSS), aceptado v1. `/blog/` con trailing slash hace 2-hop chain por Odoo strip-trailing-slash, SEO leve aceptado.

**Q6 — `/page/kit-digital`**:
- avanzosc.es legacy NO tiene `/page/kit-digital` (curl 404, ausente de sitemap.xml). Redirect defensivo para bookmarks externos hipotéticos.
- Decisión: 301 a `/#kit-consulting` (anchor home, snippet `s_avanzosc_cta_kit_consulting`).
- Implementación: 2 entries `website.rewrite` (ES + EU separados, patrón consistente con `redirect_eu_slug_*`). Anchor `id="kit-consulting"` añadido al `<section>` del snippet en mismo commit.
- URL legacy nunca existió en producción → no preserva tráfico SEO real, solo defensivo.

**Validación**: 13/15 URLs blog específicas + raw `/blog` + EU `/eu_ES/blog` + `/page/kit-digital` ES + EU verificados con `curl -o /dev/null -w '%{http_code} %{redirect_url}'` post-restart. Smoke verde. Implementación en commit `[FEAT] post-v1: add Q5/Q6 legacy redirects`.

---

## 6. Decisiones diferidas con criterio de reapertura

Pendientes que no requieren acción inmediata pero deben re-evaluarse cuando se cumpla un trigger específico.

<a id="deferred-publicwidget-body"></a>
### Investigar por qué `publicWidget` con `selector: 'body'` no auto-instancia

**Estado**: workaround vía D15 (engancharse a `AvanzoscRoot.start()`). Razón exacta no investigada.

**Hipótesis a probar si reabre**: orden de registry en `odoo.define` dispatch, o el lifecycle de `publicWidget.RootWidget._startWidgets` que cachea la lista de widgets antes de que el module se registre.

**Trigger de reapertura**: si en una próxima feature necesitamos un widget global (selector `body`, `html`, o sin selector) y el workaround D15 no encaja, investigar el lifecycle a fondo. Hasta entonces, no merece tiempo.

<a id="deferred-ttfb-prod"></a>
### TTFB en producción real — re-validar Propuesta B

**Estado**: D20 implementado (recorte fade) bajo medición localhost (TTFB ~25 ms). Si el TTFB en `https://avanzosc.es/` post-switchover es significativamente mayor (>300 ms), el cuello cambia de naturaleza y D20 deja de ser suficiente.

**Trigger de reapertura**: tras switchover Phase 10.6, ejecutar el bloque de mediciones (5 corridas de cada sectorial + home + /contacto) per metodología sub-bloque A5. Si TTFB mediano >300 ms o load >700 ms, abrir Propuesta B (hold overlay until JS ready) como iteración A7.

**Mediciones de referencia (localhost dev, sesión 2026-04-30)**:
| URL | TTFB | DCL | Load | Lazy KB |
|---|---|---|---|---|
| / | 26 | 64 | 68 | 1587 |
| /contacto | 22-27 | 60-91 | 69-102 | 1587 |
| /industrial | 23 | 64 | 67 | 1587 |
| /conocenos | 25 | 68 | 76 | 1587 |
