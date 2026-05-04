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

`website_blog` quedó instalado en BD de la ronda anterior pero NO se declara en `depends` de `website_avanzosc_demo`. Quedaba residual e invisible al no tener menú ni enlaces. **Post-v1 sesión 2026-04-30: DESINSTALADO** — el hijack de sus converters `<model('blog.blog')>` sobre rutas `/blog/<slug>` impedía Q5 redirects limpios (entries `website.rewrite` literales nunca llegaban a `_serve_redirect` porque el converter falla con redirect a default blog, no con 404). Pre-check 0 dependencias instaladas; `button_immediate_uninstall()` vía `odoo-bin shell`. Reversible: el día que Avanzosc decida activar el canal blog con persona dedicada, basta con `-i website_blog` y añadirlo a `depends`. Detalle en D21.

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
### D21 — Q5/Q6 cerrados: redirects 301 legacy avanzosc.es + uninstall `website_blog`

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
- Decisión inicial (commit `f39d62b`): 301 a `/#kit-consulting` (anchor en home, snippet teaser).
- Decisión final (commit fix posterior): **301 a `/kit-consulting`** (página dedicada, 24KB contenido, H1 + 6 secciones). Razón: visitante con bookmark legacy busca info real del programa, no el teaser de 1 párrafo en home. Adicionalmente Odoo strippea fragment del `url_to` por design — el `#` original era no-op.
- Implementación: 2 entries `website.rewrite` (ES + EU separados, patrón consistente con `redirect_eu_slug_*`). Anchor `id="kit-consulting"` se mantiene en el `<section>` del snippet (deuda mínima sin coste, podría reusarse en futuro para link interno al teaser).

**Uninstall `website_blog` post-fix Q5**:
- `f39d62b` aplicó 15 entries específicas + custom controller, pero 2 URLs (`/blog/odoo-1` y `/blog/odoo-1/feed`) seguían hijack-eadas por `website_blog` (Odoo demo) que devolvía 301 a `/blog/travel-1*` con artículos sobre Sierra Tarahumara — peor que 404 (daño reputacional real).
- Verificación previa: el converter `<model('blog.blog')>` para 1-segment URLs tiene fallback al primer blog activo; el flow nunca devuelve 404 → `_serve_redirect` nunca se evalúa → entry literal no aplicable.
- Decisión: desinstalar `website_blog`. Pre-check: `SELECT m.name FROM ir_module_module_dependency d JOIN ir_module_module m ON d.module_id = m.id WHERE d.name='website_blog' AND m.state='installed'` → 0 dependencias → safe uninstall. Ejecutado vía `odoo-bin shell` con `mod.button_immediate_uninstall()`.
- Pre-spec «Blog» (sesión 2026-04-27) ya marcaba `website_blog` como «residual e invisible»; este uninstall ejecuta esa decisión diferida y resuelve hijack.
- Las 15 entries específicas + controller wildcard se MANTIENEN: defensa en profundidad si `website_blog` se reinstala en v2 (escenario explícitamente reservado en pre-spec «Blog»: «si en v2 se decide retomar el canal, basta con reactivar»).

**Validación final**: 15/15 URLs blog específicas + raw `/blog` + EU `/eu_ES/blog` + `/page/kit-digital` ES + EU + `/blog/travel-1*` (ya 301 a `/` por wildcard, demo data desaparecida). Smoke verde. Implementación en commits `f39d62b` (entries + Q6 inicial) + `[FIX] post-v1: uninstall website_blog (resolves Q5 hijack on /blog/odoo-1) + repoint Q6 to /kit-consulting dedicated page`.

<a id="d22"></a>
### D22 — Q2 cerrada: alias público `/clientes` para botón «Acceso clientes»

Sesión 2026-04-30. Bloqueo blando spec §13 #2 («URL final del portal pendiente») se cierra.

**Decisión**: el botón «Acceso clientes» del header apunta a `/clientes` como URL pública. Esa URL redirige 301 a `/web/login` (módulo Odoo core). La URL canónica `/web/login` queda como detalle de implementación interno; el visitante ve `/clientes` en la barra de direcciones al hacer hover/click, mejor branding y memoria de URL.

**Implementación**:
- `views/layout.xml` L31 (botón desktop) y L247 (mobile overlay): href `/web/login` → `/clientes`. La clase `s_avanzosc_acceso_clientes` y `s_avanzosc_acceso_clientes_mobile` no cambian.
- `data/redirects.xml`: 2 entries `website.rewrite` con `redirect_type='301'`:
  - `/clientes` → `/web/login` (`redirect_clientes_to_login_es`)
  - `/eu_ES/clientes` → `/web/login` (`redirect_clientes_to_login_eu`)

**Hallazgo render EU**: Odoo lang-routing añade prefijo `/eu_ES/` automáticamente al render del href del template (`<a href="/clientes">` → renderizado como `/eu_ES/clientes` cuando `request.lang.code='eu_ES'`). La entry redirect EU explícita cubre exactamente ese caso. Resultado: el visitante en EU ve `/eu_ES/clientes` en hover y al click es 301 a `/web/login` (login Odoo core ES-only por design — Odoo aplica lang-detect en el form de login según preferencias del usuario, no via URL prefix).

**Validación**: `curl -I /clientes` → 301 → `/web/login`. `curl -I /eu_ES/clientes` → 301 → `/web/login`. `curl -I /web/login` → 200 (login intacto). `curl /` HTML contiene `href="/clientes"`. `curl /eu_ES/` HTML contiene `href="/eu_ES/clientes"`. Smoke verde. Implementación en commit `[FEAT] post-v1: add /clientes alias for "Acceso clientes" header button (Q2 closed)`.

<a id="d23"></a>
### D23 — Eliminación de la página `/trabaja-con-nosotros` («Empleo»)

Sesión 2026-04-30. La página corporativa `/trabaja-con-nosotros` (etiquetada «Empleo» en el menú) se elimina del sitio. Esta entrada consolida la decisión que estaba dispersa entre commit `4ecd0e1`, comentarios inline en `data/menu.xml` / `views/layout.xml`, y secciones §2 + §8 de CLAUDE.md.

**Decisión**: eliminar template, record `website.page`, entrada de menú top-level, link en footer Empresa, link en mobile overlay, entry de sitemap canónico (controllers/main.py), 21 strings exclusivas de `eu.po`. URL legacy redirige 301 a `/conocenos` para preservar enlaces externos. Slug EU vanity `/lan-egin-gurekin` reapuntado al destino correcto.

**Racional**: decisión de producto (orquestador humano) — la página tenía contenido genérico (perfiles abiertos genéricos, sin vacantes formales activas) que no aportaba diferenciación frente a un email directo a `comercial@avanzosc.es`. Mantenerla obligaba a actualizarla cada vez que la situación de contratación cambiara (drift inevitable). Eliminación radical + redirect → simplificación operativa.

**Implementación** (commit `4ecd0e1`):
- Borrado de `views/pages/trabaja_con_nosotros.xml` (92 líneas).
- `data/menu.xml`: record `menu_trabaja` retirado; comentario actualizado de «los 2 últimos secundarios» a «el último secundario».
- `data/redirects.xml`: 3 entries 301 nuevas (`/trabaja-con-nosotros` ES, `/eu_ES/trabaja-con-nosotros` EU, `/lan-egin-gurekin` vanity → `/eu_ES/conocenos`).
- `data/cleanup_empleo_removal.xml`: `<delete search>` declarativo idempotente para records con `noupdate=1` que persistían en BD tras retirar el xml_id (patrón análogo a D8).
- `views/layout.xml` L187 (footer Empresa) + L324 (mobile overlay): links retirados.
- `controllers/main.py:_CANONICAL_PAGES`: entry `/trabaja-con-nosotros` retirada (sitemap baja de 23 a 21 URLs).
- `i18n/eu.po`: 21 entries removidas (20 exclusivas del template + 1 «Empleo» compartida que perdió sus 2 referentes — menu+footer). Total fuzzy: 201 → 180.
- `docs/q1-eu-validation/`: XLSX regenerado (180 entries), 8 PNGs regeneradas, README versionado v3.

**Trade-offs**:
- Decisión irreversible salvo recreación manual del template; per scope v1 acceptable.
- Si la asesoría laboral de Avanzosc requiere que la web liste perfiles abiertos por compliance, hay que reabrir esto. No identificado como obligación a fecha.

**Validación**: smoke verde, 6/6 verificaciones curl post-fix (redirects 301 ES+EU+vanity, /conocenos 200 ES+EU, sitemap 21 URLs, HTML home sin «Empleo»). Detalle en commit message.

<a id="d24"></a>
### D24 — Q3 fase 1: paquete dev pre-revisión legal + 5 fixes obvios aplicados

Sesión 2026-04-30. Q3 (revisión legal páginas /aviso-legal, /politica-privacidad, /politica-cookies por asesoría externa) sigue siendo gate humano bloqueante para switchover. Esta entrada documenta el progreso intermedio: paquete pre-revisión interno del dev + 5 fixes detectados que se pueden aplicar sin competencia legal.

**Fase 1 — Paquete pre-revisión** (commit `0e152e7`):

Generado en `docs/q3-legal-validation/dev-prereview-2026-04-30/`:
- `pdfs/01-aviso-legal-es.pdf`, `02-politica-privacidad-es.pdf`, `03-politica-cookies-es.pdf` — render desktop ES con Chrome headless, fuente principal para revisión humana visual.
- `avanzosc-q3-legal-prereview-2026-04-30.xlsx` — 23 strings LEGAL DRAFT del `.po`, columnas reducidas (ID Q3-XXXXXX + ES + Notas dev + Contexto). Pestaña 0 INSTRUCCIONES con banner rojo «NO sustituye revisión legal profesional».
- `tools/gen_q3_prereview_xlsx.py` — script generador autocontenido derivado del flujo Q1, reusa `compute_row_height` para evitar text overlap.
- `datos-sensibles-extraidos.md` — tabla con todos los datos identificativos (CIF, dirección, email, teléfono, jurisdicción), datos NO presentes que la asesoría puede pedir (Reg. Mercantil, DPO específico), cookies declaradas, marcos normativos referenciados, + 6 decisiones que solo la asesoría puede tomar.

**Fase 1 — 5 fixes obvios aplicados** (commit `12a742a`):

Detectados durante la extracción del paquete; arreglables sin competencia legal:

1. **LOPDGDD body cite** en `/politica-privacidad` §1 (`views/pages/legal_privacidad.xml`): párrafo introductorio nuevo que cita explícitamente RGPD (Reglamento UE 2016/679) Y LOPDGDD (Ley Orgánica 3/2018) antes del listado de datos del responsable. Resuelve incoherencia subtítulo (que decía «RGPD y LOPDGDD») vs body (que solo citaba RGPD).

2. **Cookies tabla estructurada** en `/politica-cookies` §2 (`views/pages/legal_cookies.xml`): `<ul>` reemplazado por `<table class="table table-striped">` con cabeceras Nombre / Propósito / Duración / Tipo. Fila `visitor_uuid` lleva comentario QWeb interno marcando que la clasificación «Análisis propio agregado» queda pendiente decisión asesoría Q3.

3. **Link clickable a /politica-cookies** en `/politica-privacidad` §2 (`views/pages/legal_privacidad.xml`): «(ver Política de Cookies)» → «(ver `<a href="/politica-cookies">`Política de Cookies`</a>`)».

4. **mailto: en aviso §1** (`views/pages/legal_aviso.xml`): `comercial@avanzosc.es` → `<a href="mailto:comercial@avanzosc.es">`. Coherencia con privacidad §7 que ya lo tenía.

5. **AEPD URL canónica** en `/politica-privacidad` §7 (`views/pages/legal_privacidad.xml`): `https://www.aepd.es` → `https://www.aepd.es/` (con barra final). Verificación previa: `curl -I https://aepd.es` → 301 → `https://www.aepd.es/`. La canónica per redirect oficial es la versión con `www` y barra final.

**Strings nuevas no propagadas a `eu.po`**: los fixes 1 y 2 introducen ~10-12 strings nuevas en QWeb (párrafo LOPDGDD + cabeceras tabla cookies + reorganización celdas) que NO están en el `.po`. El flujo `-u` aplica traducciones existentes pero no extrae nuevas. Para Q3 fase 2 (paquete formal a asesoría) se ejecutará `i18n_export` o se añadirán manualmente al `.po` con marker LEGAL DRAFT y se regenerará el XLSX prereview. En esta fase 1 los PDFs son fuente principal y las strings nuevas son visibles ahí.

**Próximos pasos Q3**:
1. Dev pre-revisión humana: marcar checkboxes en `datos-sensibles-extraidos.md`, anotar issues en columna «Notas dev» del XLSX.
2. Aplicar correcciones del dev (si las hay) en otro commit.
3. Generar paquete Fase 2 formal a asesoría externa en `docs/q3-legal-validation/for-legal-advisor-YYYY-MM-DD/`.
4. Trigger Q3 humano externo.
5. Aplicar correcciones de la asesoría.
6. Levantar markers `LEGAL DRAFT - REVIEW NEEDED` del `.po`.
7. Switchover desbloqueado (también pendiente Q1).

**Validación**: smoke verde post-`12a742a`. 5 fixes verificados visibles en HTML pre-render via curl (mailto, LOPDGDD, link cookies, AEPD canonical, table.table-striped). Detalle en commit messages.

<a id="d25"></a>
### D25 — Q4 cerrada: Plausible Analytics (script combinado outbound-links + 404 + goal «Contact Form Submission»)

Sesión 2026-05-04. Q4 (analytics web) era pendiente de §11 CLAUDE.md
(«Analytics y tracking — GA4, Plausible o Matomo. Decidir antes de
producción»). Cierre con Plausible Cloud sobre `data-domain="avanzosc.es"`.

**Decisión**:
- **Plausible Cloud** (hosted EU) por encima de GA4 y Matomo.
- Script combinado **outbound-links + 404** (auto-tracking de clicks externos + 404 manual desde la propia página /404 si Avanzosc decide servir una en el futuro).
- Goal **«Contact Form Submission»** disparado desde `/contacto/gracias` en DOMContentLoaded (post-redirect-get del form).

**Razones**:

1. **RGPD-friendly por diseño**: sin cookies, sin localStorage, sin huella personal individual. No requiere consent banner ni encaja en el scope ePrivacy de cookies. Coherente con la posición B2B-industrial de la web (consultora seria, sin oscuridad legal).
2. **Hosted EU**: no aplica el mecanismo Schrems II (transferencia a USA). Coherente con audiencia y con la posición legal interna del proyecto.
3. **Coste aceptable**: ~100€/año es trivial frente a la operación.
4. **Setup mínimo**: una etiqueta `<script>` + un evento custom. Sin ingeniería ni mantenimiento ongoing.

**Alternativas descartadas**:

- **GA4**: complicación RGPD post-Schrems II (transferencia a USA con Standard Contractual Clauses), requeriría consent banner, modelo de monetización publicitaria + ad-targeting contrario al tono del rediseño.
- **Matomo self-hosted**: overhead operacional inaceptable (instancia propia + actualizaciones + backups). Matomo Cloud EU sería alternativa válida; precio similar pero UX más densa que Plausible.
- **Sin analytics**: aceptable v1 pero ciegos al impacto del rediseño. Imposible iterar sin métricas básicas (visitas, fuente de tráfico, páginas con más tracción, conversión a contacto).

**Implementación**:

- `views/assets.xml`: nuevo `<template id="head_plausible" inherit_id="web.layout">` inyecta el `<script>` en `<head>` con `defer`, `data-domain="avanzosc.es"`, src `https://plausible.io/js/script.404.outbound-links.js`. Sibling semántico de `head_external_assets` (que registra fonts + GSAP + Lenis).
- `views/pages/contacto_gracias.xml`: inline `<script>` al final del `<main>` con `document.addEventListener('DOMContentLoaded', function(){ if (window.plausible) window.plausible('Contact Form Submission'); })`. Patrón canónico de Plausible (idéntico al snippet oficial para tracking de 404). Guard `if (window.plausible)` para resiliencia contra adblock o script bloqueado.

**Hallazgo URL canónica del script**: la suposición pre-implementación era `script.outbound-links.404.js` (extensions en orden «funcional»). Verificación empírica con `curl -I` mostró que ese URL **devuelve 404**; la URL correcta sigue **orden alfabético** del filename: `script.404.outbound-links.js` (200 OK). La convención de Plausible es alfanumérica per filename concatenation. La docu de context7 no muestra el filename combinado explícitamente; verificar siempre contra el CDN.

**Por qué `/contacto/gracias` y no hook en submit del form**: el form usa Post-Redirect-Get (controller `WebsiteAvanzoscContact.contacto_submit` devuelve 303 a `/contacto/gracias`). Hookear en submit-time tiene riesgos de race con la navegación inmediata (la request a `plausible.io/api/event` puede cancelarse antes de salir aunque Plausible use `keepalive`). Hookear en DOMContentLoaded de gracias es el canal limpio: sólo se llega a esa página tras validación server-side exitosa. Edge case: el honeypot también redirige a gracias silenciosamente; bots que ejecuten JS Y burlen el bot-filtering de Plausible inflarían el goal — aceptado v1 (incidencia esperada cercana a cero).

**Localhost behavior**: Plausible script suprime envíos cuando el hostname del navegador no coincide con `data-domain`. En desarrollo (`localhost:14070`) los eventos no llegan al dashboard; producción (`avanzosc.es`) los disparará normalmente. La verificación dinámica local es entonces estática-en-DOM (script tag presente, listener registrado, signature exacta del goal verificada activamente con stub de `window.plausible`). Mismo comportamiento durante QA en `nueva.avanzosc.es`: dominio mismatch → eventos suprimidos → no contamina el dashboard de producción con tráfico de pre-producción (efecto colateral deseable).

**Trigger de reapertura**: si tras 6 meses post-switchover Plausible no da datos suficientes para decisiones de negocio (e.g., demasiado escueto para análisis de funnel B2B), reabrir y considerar añadir GA4 con consent banner como segunda capa para datos enriquecidos. Mantener Plausible como baseline RGPD-friendly aunque se sume otra capa.

**Implicaciones Q3 fase 2**: el aviso legal y la política de privacidad deben mencionar el uso de Plausible Analytics + ausencia de cookies de tracking + link a la política de Plausible. Recordatorio archivado en `docs/q3-legal-validation/plausible-analytics-pending-additions.md` para que quien genere el paquete formal a asesoría no lo olvide.

**Validación**: smoke verde post-implementación. Verificación dinámica Playwright: a) GET `/` confirma `<script defer data-domain="avanzosc.es" src="https://plausible.io/js/script.404.outbound-links.js">` en `<head>`; b) GET `/contacto/gracias` confirma inline script presente con guard `if (window.plausible)` + listener `DOMContentLoaded` + nombre exacto del goal `Contact Form Submission` (verificación activa con stub de `window.plausible` capturando `[['Contact Form Submission']]`).

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

<a id="deferred-anchor-kit-consulting-orphan"></a>
### Anchor `id="kit-consulting"` huérfano en home — reusar o cleanup

**Estado**: añadido en commit `f39d62b` al `<section>` del snippet `s_avanzosc_cta_kit_consulting` como target del redirect Q6 inicial (`/page/kit-digital → /#kit-consulting`). Tras cambio de destino Q6 a `/kit-consulting` (página dedicada) en commit `ded3240`, el anchor quedó funcionalmente huérfano: ningún link interno o redirect lo usa actualmente.

**Decisión diferida**: mantener el anchor (deuda mínima sin coste; añade ~30 caracteres al HTML del home).

**Trigger de reapertura**: si v2 plantea un link interno desde otro snippet/template al teaser de Kit Consulting del home (e.g., un nav anchor desde el menú o un CTA cross-page), reusar este anchor en lugar de crear uno nuevo. Si tras 6+ meses sin uso del anchor se considera limpieza, cleanup en commit dedicado retirando el `id="kit-consulting"` del `<section>` y la nota inline en `views/snippets/cta_kit_consulting.xml`.

<a id="deferred-navbar-1024px-overflow"></a>
### Navbar 992-1100px overflow `[+]` con 1 solo item secundario

**Estado**: post eliminación de `/trabaja-con-nosotros` (D23), el navbar a anchura desktop intermedia (992-1100px aprox.) tiene **1 solo item secundario** (Conócenos) dentro del overflow group `[+]`. El comportamiento heredado del setup pre-D23 listaba 2 items secundarios (Conócenos + Empleo) en ese overflow; con 1 solo, mostrar overflow para un único item es UX subóptima.

**Validación pendiente**: ningún humano ha verificado visualmente el navbar a esta anchura específica en sesión 2026-04-30. La validación humana del commit `4ecd0e1` cubrió eliminación correcta vía menú mobile, no anchura intermedia desktop.

**Decisión diferida**: NO fix preventivo. El overflow group sigue funcional (Conócenos accesible vía clickear `[+]`), solo es subóptimo visualmente.

**Trigger de reapertura**: si revisor lingüístico EU (Q1), asesoría legal (Q3), o cualquier humano externo reporta UX raro en menú a anchura desktop reducida (995-1095px aproximadamente). Fix estimado <30 min: eliminar la lógica de overflow cuando solo queda 1 item secundario, mostrarlo directo en navbar. Localización probable: `static/src/scss/snippets/_header.scss` o JS asociado.

<a id="deferred-acceso-clientes-dry-violation"></a>
### DRY violation desktop+mobile en botón «Acceso clientes»

**Estado**: el botón «Acceso clientes» vive en 2 ubicaciones del template:
- `views/layout.xml:31` (desktop, override de `template_header_default_oe_structure_header_default_1`).
- `views/layout.xml:247` (mobile overlay, dentro de `header_mobile_buttons`).

Cualquier cambio al href o al label requiere editar ambos sitios. El commit `730c7b7` (Q2) editó ambos; futuros cambios mantendrían el patrón. DRY violation pre-existente al commit Q2 — no introducida por él.

**Decisión diferida**: aceptar la duplicación.

**Trigger de reapertura**: si v2 cambia el destino del botón otra vez, o si se decide refactorizar el header para extraer el botón a un sub-template QWeb reutilizable (e.g., `<t t-call="website_avanzosc_demo.acceso_clientes_button"/>` invocado desde ambos sitios). Coste estimado de la refactorización: 30-45 min — extraer template + sustituir las 2 inclusions + smoke. Coste actual de mantener la duplicación: 1 edit doble cada vez que cambia algo del botón.

<a id="deferred-q4-gracias-direct-access"></a>
### Acceso directo a `/contacto/gracias` cuenta como conversión falsa en Plausible

**Estado**: el goal Plausible «Contact Form Submission» se dispara en DOMContentLoaded de `/contacto/gracias` (per D25). La página tiene `is_published=True` (necesario para que el redirect 303 del controller resuelva 200) y por tanto es accesible vía GET directo. Cualquier acceso que no provenga del flow legítimo (refresh post-submit del usuario, share del link por curiosidad, navegación manual) cuenta como conversión falsa en el dashboard Plausible.

**Decisión diferida**: aceptar el ruido bajo. La página no está enlazada desde menú, footer ni otras navegaciones del sitio; `website_indexed=False` evita que aparezca en SERP de Google (no captará tráfico orgánico). El conteo de envíos reales es visible en backend de Odoo (`mail.mail` registros generados por el controller `WebsiteAvanzoscContact.contacto_submit`) — sirve de cross-check independiente.

**Workaround vigente**: ninguno.

**Trigger de reapertura**: si tras 2-3 meses post-switchover el conteo de goals «Contact Form Submission» en Plausible **supera de forma significativa** (e.g., +20%) el conteo de envíos reales registrados en backend (records de `mail.mail` enviados por el controller, contables vía SQL contra `mail_message` per gotcha §7 CLAUDE.md), migrar al patrón de flag de sesión:

1. `WebsiteAvanzoscContact.contacto_submit`: `request.session['contact_submitted'] = True` antes del `request.redirect(self._gracias_url())`.
2. `views/pages/contacto_gracias.xml`: el inline script lee y consume el flag antes de disparar el goal — algo equivalente a un `t-if` en QWeb que envuelva el `<script>` completo, leyendo `request.session.get('contact_submitted')`. Tras lectura, `pop` para que el siguiente refresh ya no dispare.

Coste estimado del fix: 20-30 min (controller + template + test del consumo del flag). Mantener D25 como decisión raíz; este patrón es la iteración 2.

**Sub-trigger lateral**: si Q3 post-asesoría exige consent banner para Plausible (escenario que D25 considera improbable pero posible), reabrir esto y migrar al flag de sesión a la vez que se reformula el setup analytics — esfuerzo combinado.

<a id="deferred-conocenos-stem-claim"></a>
### Claim «Equipo STEM mayoritariamente femenino» en body `/conocenos`

**Estado**: el body de `/conocenos` (snippet `s_avanzosc_equipo` invocado desde `views/pages/conocenos.xml`) contiene actualmente el claim «Equipo STEM mayoritariamente femenino» y referencias derivadas (~6 menciones de «STEM»/«femenino» entre la copia ES y la traducción EU). Durante Sprint B2 (commit `73933f4`) el orquestador-humano confirmó que el claim demográfico de «mayoría femenina» no es sostenible factualmente. La meta description de `/conocenos` fue limpiada en el amend B2 (eliminando «STEM» y «mayoritariamente femenino» de los textos SEO), pero el body permanece sin tocar por política «copy creativo al final del proyecto» — el body es contenido editorial sujeto al sprint final de revisión narrativa, no una iteración técnica.

**Decisión diferida**: aceptar el claim en body durante la fase de desarrollo. La branch sigue siendo `feature/v1-implementation` y `robots.txt` devuelve `Disallow:/` (intencional pre-switchover, C4 / D6), por lo que NO hay exposición pública: ni Google, ni LinkedIn shares, ni visitantes orgánicos ven la copia. Riesgo factual = 0 mientras esto siga así.

**Workaround vigente**: ninguno — el claim queda en la web mientras la branch sea `feature/v1-implementation` y `robots.txt` siga bloqueando indexación. La meta description (que SÍ es shareable de forma cacheada por motores) ya está limpia post-B2.

**Trigger de reapertura**: **pre-switchover OBLIGATORIO**. En el sprint final de revisión de copy creativo (parkeado por política), revisar las ~6 menciones STEM/femenino en `/conocenos` body + las equivalentes en `/eu_ES/conocenos` (vía `i18n/eu.po`) y decidir entre 3 alternativas:
- (a) **Eliminar el claim demográfico**, manteniendo «STEM» pero retirando «mayoría femenina» y derivadas. Más mínimo invasivo.
- (b) **Reformular para enfatizar diversidad** sin afirmaciones cuantitativas no verificables (e.g., «equipo técnico diverso, perfiles STEM»). Sostenible, demuestra cuidado.
- (c) **Eliminar la sección entera** del snippet equipo y reescribir desde cero con el copy refinado del sprint final.

Aplicar el cambio elegido en `views/snippets/equipo.xml` (o template equivalente) + sincronizar `i18n/eu.po` (ya con flags DRAFT, sujeto a Q1 fase 2). Smoke `run-smoke.sh` + curl spot check confirmando 0 menciones de «STEM»/«femenino» en body Y meta. **Sin este trigger atendido, NO autorizar switchover** — el claim factualmente insostenible no debe llegar al dominio público.

**Localización**: el snippet de equipo invocado por la página de conócenos (probablemente `views/snippets/equipo.xml`); las referencias EU correspondientes en `i18n/eu.po` (entries marcadas `# DRAFT - REVIEW NEEDED — Equipo STEM …` o similar). Verificación de count: `curl -s http://localhost:14070/conocenos http://localhost:14070/eu_ES/conocenos | grep -ciE 'STEM|femenin'` — esperado 0 post-fix.

<a id="deferred-lighthouse-best-practices-upstream"></a>
### Lighthouse Best Practices score 81-82/100 — deuda upstream Odoo 14

**Estado**: la auditoría a11y/SEO 2026-05-04 capturó 2 fallos Lighthouse Best Practices con origen upstream en el stack Odoo 14, no en código del módulo:

- **N3 — `deprecations`**: el bundle `web.assets_common` / `web.assets_frontend` de Odoo 14 usa APIs deprecated del navegador (probablemente `unload` listeners, `MutationEvent`, o similar legacy heredado del frontend de Odoo). Aparece en 12/12 URLs auditadas.
- **N4 — `valid-source-maps`**: bundles JS grandes de Odoo (`web.assets_common`, `web.assets_frontend`) sirven minificados sin source maps. Aparece en 12/12 URLs.

Score Best Practices estancado en 81-82/100 (mobile/desktop, ES y EU) por estos 2 issues.

**Decisión**: NO fixear en v1. Razones específicas por issue:

- **N3 (deprecations)**: el horizonte real de impacto es de años (Chrome aún no ha retirado las APIs marcadas como deprecated). Fixear desde el módulo requeriría parchear core Odoo, que rompe la regla §10 CLAUDE.md «no modificar `/opt/odoo/v14/odoo/addons/`». La migración a Odoo 15+/16+ probablemente cierra este issue por sí sola al actualizar el stack.
- **N4 (valid-source-maps)**: decisión upstream consciente — Odoo bundle minifica para producción y NO emite source maps. Activarlos en producción expondría estructura de código sin beneficio para usuarios finales (devs ya tienen acceso al source local). Trade-off no compensa.

**Workaround vigente**: ninguno. Score BP 81-82 aceptado como techo v1. El score se mantendrá ahí mientras dependamos de Odoo 14 sin parches al core.

**Trigger de reapertura**: evaluación de migración a Odoo 15+/16+, donde:
- N3 puede estar resuelto en core (Odoo upstream actualiza APIs).
- N4 puede tener distinto trade-off (Odoo 16+ podría incluir source maps opcionales).
Cuando se decida la migración, re-ejecutar Lighthouse y re-evaluar ambos. Si tras la migración persisten, abrir nueva entry deferred específica de la versión nueva.

<a id="deferred-brand-primary-contrast"></a>
### Contraste insuficiente en `--brand-primary` — 15 nodos C3 brand pendientes (Sprint B3 Path B)

**Estado**: la auditoría a11y/SEO 2026-05-04 (audit C3, REPORT.md §4) detectó 28 nodos `color-contrast` violations. Sprint B3 Path B (commit B3) cerró 13 nodos no-brand (G2/G4 vía `--neutral-500` darken `#7A828B → #646C75`; G5 vía override `nav.navbar.navbar-light .navbar-nav .nav-link`). Quedan 15 nodos cuyo fix requiere ajustar `--brand-primary` o variables brand derivadas:

- **G1 — 13 nodos `.btn.btn-primary`** con `#FFFFFF` text on `#E85D2F` background (ratio 3.47:1, FAIL ≥4.5):
  - 12 instancias del botón «Acceso clientes» en el header (sitewide, una por página auditada).
  - 1 instancia del CTA «Hablar con Avanzosc» (`.btn-lg`) en `/kit-consulting`.
- **G3 — 2 nodos `.s_avanzosc_contacto_info_link`** «Ver en Google Maps» con `#E85D2F` text on `#FFFFFF` (ratio ~3.5:1).

**Decisión diferida**: NO ajustar `--brand-primary` v1. El módulo carece de **brand source of truth** autoritativa — el hex actual `#E85D2F` es propuesta inicial (CLAUDE.md §9.3 marca «pendiente de extracción del logo», y §13 reitera «Hex finales del logo + SVG» como gate pre-switchover). El logo disponible es bitmap de baja calidad; aplicar hex aproximados extraídos arriesga drift respecto al brand real.

**Workaround vigente**: ninguno. Los 15 nodos siguen incumpliendo WCAG AA hasta que el orquestador-humano consiga el manual de marca / SVG vectorial fuente.

**Trigger de reapertura**: cuando llegue brand source of truth. Acción:
1. Ajustar `--brand-primary` y `--brand-primary-dark` según hex auténticos extraídos del logo.
2. Verificar contraste WCAG AA con WebAIM checker:
   - Para G1 (white text on brand bg): brand-primary debe dar ≥4.5:1 contra `#FFFFFF` (texto normal). Actual `#C44015` (--brand-primary-dark) ya es candidato — preliminar ratio ~5.6:1 vs blanco. Si encaja con brand auténtico, swap `--brand-primary` ← `--brand-primary-dark` actual y derivar nuevo `--brand-primary-dark` (más oscuro aún).
   - Para G3 (brand text on white bg): mismo target ≥4.5:1 — la misma fix de G1 cubre esto automáticamente porque ambos usan `--brand-primary`.
3. Smoke + axe-core spot check sobre las 12 URLs auditadas confirmando 0 violations color-contrast residuales.

**Bloquea switchover**: NO al mismo nivel que `deferred-conocenos-stem-claim` (que es factual). Aquí el pendiente es brand-coherence + WCAG AA. La auditoría queda en estado **«AA parcial documentado»**: 13/28 nodos cerrados (46%), 15 deferred con motivo arquitectónico claro (brand source of truth), no incumplimiento doloso. EAA 2025 entra en vigor en junio — se recomienda cerrar este deferred antes de Phase 10.6 switchover, pero el deferred no es bloqueante mecánico (vs Q1/Q3/Q4 sí lo son).

**Acoplamiento con otros pendientes**:
- §11 «Hex finales del logo + SVG» — mismo trigger (brand source of truth disponible).
- §11 «Hex finales del logo + SVG» bloquea CLAUDE.md §9.3 «Paleta de color» actualización.
- Resolver los 3 a la vez: extraer hex del logo → actualizar `--brand-primary` y `--brand-secondary` → cerrar este deferred → cerrar gate logo en §11.

**Validación post-fix esperada**: axe-core sobre 12 URLs → `color-contrast` violations = 0. Lighthouse a11y score ya está en 96 (post-B1+B2); cerrar G1+G3 lo acerca a 100. Si tras el fix de brand alguno de los 15 nodos persiste flagged, abrir entry específica.
