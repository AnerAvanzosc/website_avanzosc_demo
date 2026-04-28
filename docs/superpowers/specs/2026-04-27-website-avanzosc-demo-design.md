# Spec — `website_avanzosc_demo` v1

> Status: borrador para revisión · Fecha: 2026-04-27
> Lectura prioritaria: leer antes CLAUDE.md §1–§11 completo. Este spec **referencia, no copia**.

---

## 1. Resumen ejecutivo

- **Qué es**: módulo Odoo 14 `website_avanzosc_demo` que sustituye la web genérica actual de avanzosc.es por una corporativa con personalidad de marca, todo dentro de la misma instancia Odoo (CLAUDE.md §1).
- **Para quién**: prospects B2B (PYME industrial / distribución / servicios / academias) que evalúan partner Odoo. Secundario: clientes actuales que entran al portal ERP.
- **Decisiones clave** (CLAUDE.md §11): bilingüe ES + EU (raíz ES + `/eu/` con slugs traducidos), claim «Odoo industrial de verdad, desde 2008.», home en 8 secciones / 9 snippets propios + 1 sectorial, 8 archetypes anónimos, blog fuera, sin builder visual.
- **Entrega v1**: home + 4 sectoriales + conócenos + trabaja con nosotros + contacto + landing kit-consulting + header/footer + skin sobre `website_sale` y `website_slides`.
- **Fuera de v1**: blog (CLAUDE.md §11), modo oscuro (CLAUDE.md §9.3), modelos Python custom (no necesarios), drag & drop en builder (D4 de §2 abajo).

---

## 2. Decisiones de esta sesión aún no reflejadas en CLAUDE.md §11

Cerradas en el turno 2026-04-27 posterior al cierre de §11. **El spec las trata como decididas.** Tras aprobar este spec → commit aparte que las añade a CLAUDE.md §11 y, donde aplique, a §8.

| # | Decisión | Resumen |
|---|---|---|
| D1 | Páginas sectoriales | Estructura común: hero sectorial · subsectores (QWeb estático) · `s_avanzosc_sector_specifics` (bloque por sector) · archetypes filtrados · `s_avanzosc_cta_contacto`. |
| D2 | Slugs URL EU | Traducidos al euskera (`/eu/industriala/`, `/eu/banaketa/`, `/eu/zerbitzuak/`, `/eu/akademiak/`). Resto de slugs EU pendientes de validación lingüística por equipo Avanzosc. |
| D3 | Caso de éxito home | Uno fijo configurable vía `ir.config_parameter` `website_avanzosc_demo.featured_archetype_id`. |
| D4 | Snippets en builder | NO registrados en builder. Sólo `<t t-call=…/>` desde home y páginas. |
| D5 | `/kit-consulting` | ES-only. |
| D6 | Convivencia y switchover | Web nueva en `nueva.avanzosc.es` durante desarrollo/QA. Switchover al dominio principal con 301 desde URLs antiguas. Mapeo en §11 de este spec. |

**Snippet añadido por D1**: `s_avanzosc_sector_specifics`. Total snippets v1 = 10 (los 9 de §11 decisión "Estructura de la home" + este).

---

## 3. Arquitectura del módulo

### 3.1 Manifest y dependencias

`__manifest__.py` esencial:

```python
{
    'name': 'Website Avanzosc Demo',
    'version': '14.0.1.0.0',
    'category': 'Website/Theme',
    'author': 'Avanzosc S.L.',
    'website': 'https://avanzosc.es',
    'license': 'AGPL-3',
    'depends': [
        'website',
        'website_sale',
        'website_slides',
    ],
    'data': [
        'views/assets.xml',
        'views/layout.xml',
        'data/menu.xml',
        'data/website_pages.xml',
        'data/redirects.xml',
        'views/snippets/hero.xml',
        'views/snippets/pilares.xml',
        'views/snippets/contador_modulos.xml',
        'views/snippets/timeline_trayectoria.xml',
        'views/snippets/sectores_grid.xml',
        'views/snippets/equipo.xml',
        'views/snippets/caso_exito.xml',
        'views/snippets/cta_kit_consulting.xml',
        'views/snippets/cta_contacto.xml',
        'views/snippets/sector_specifics.xml',
        'views/pages/home.xml',
        'views/pages/industrial.xml',
        'views/pages/distribucion.xml',
        'views/pages/servicios.xml',
        'views/pages/academias.xml',
        'views/pages/conocenos.xml',
        'views/pages/trabaja_con_nosotros.xml',
        'views/pages/contacto.xml',
        'views/pages/kit_consulting.xml',
    ],
    'installable': True,
}
```

`portal`, `mail`, `web_editor` entran como dependencias automáticas (CLAUDE.md §11 decisión "Módulos website-* a instalar"). `website_blog` deliberadamente fuera (CLAUDE.md §11 decisión "Blog").

### 3.2 Estructura de carpetas

Ver CLAUDE.md §8 (ya alineado con §11). Adición pendiente tras aprobar este spec: `views/snippets/sector_specifics.xml` (snippet introducido por D1).

**Carpeta `models/` mínima en v1**: solo lo necesario para el `post_init_hook` que crea la jerarquía del menú dropdown (CLAUDE.md §11 D7). Sin modelos Python custom de negocio en v1; la carpeta `models/` queda vacía con `__init__.py` placeholder. La lógica del hook vive en `hooks.py` en la raíz del módulo (no es un model, es una función a nivel de paquete invocada vía `'post_init_hook'` del `__manifest__.py`). Razón: el `Menu.create()` de Odoo 14 multi-website aplana sub-jerarquías declaradas en XML data — detalle en CLAUDE.md §11 D7.

### 3.3 Pipeline de assets

Registro vía herencia XML de `web.assets_frontend` (CLAUDE.md §4). NO `'assets': {…}` en manifest.

`views/assets.xml` carga, en orden:
1. Google Fonts (Space Grotesk, Inter, JetBrains Mono — CLAUDE.md §9.4) por `<link>` en `web.layout`.
2. Lucide Icons (CDN — CLAUDE.md §9.7).
3. GSAP 3 + ScrollTrigger desde CDN.
4. Lenis desde CDN.
5. SCSS principal (`/website_avanzosc_demo/static/src/scss/main.scss`).
6. JS principal (`/website_avanzosc_demo/static/src/js/main.js`) y un JS por snippet animado.

Versiones exactas en §9 de este spec.

### 3.4 Convenciones de IDs y nombres

Ver CLAUDE.md §4. Recordatorio operativo:
- Templates: `website_avanzosc_demo.snippet_hero`, `website_avanzosc_demo.page_industrial`, etc.
- Clases CSS de snippets: `s_avanzosc_<nombre>` (CLAUDE.md §4 «Snippets»).
- Campos custom (no aplica en v1, anotado para futuro): `x_avanzosc_*`.

---

## 4. i18n

### 4.1 Idiomas y URLs

- `website.language_ids = [base.lang_es, base.lang_eu]` (CLAUDE.md §11 decisión "Idiomas").
- ES en raíz sin prefijo, EU bajo `/eu/`.
- Slugs traducidos al euskera (D2). Mapeo de páginas:

| ES (raíz) | EU (`/eu/...`) |
|---|---|
| `/` | `/eu/` |
| `/industrial` | `/eu/industriala` |
| `/distribucion` | `/eu/banaketa` |
| `/servicios` | `/eu/zerbitzuak` |
| `/academias` | `/eu/akademiak` |
| `/conocenos` | `/eu/ezagutu-gaitzazu` **[propuesta — validar EU]** |
| `/trabaja-con-nosotros` | `/eu/lan-egin-gurekin` **[propuesta — validar EU]** |
| `/contacto` | `/eu/kontaktua` **[propuesta — validar EU]** |
| `/kit-consulting` | (no aplica — D5: ES-only) |

`/shop` y `/slides` quedan en su slug por defecto de Odoo en v1, re-skineados con el tema. Traducción nativa de los módulos `website_sale` / `website_slides`.

### 4.2 Mecanismo de traducción

- **Strings de templates QWeb**: marcados con `t-translation="on"` (default en website). Extracción vía `i18n_extract` → `.po` por idioma en `i18n/es.po`, `i18n/eu.po`.
- **Campos `website.page.url`**: traducibles. Para cada `website.page` se crea registro con URL ES y se añade traducción EU vía `_translate` o vía interfaz Odoo (Settings → Translations).
- **Campos `website.menu.name` y `website.menu.url`**: traducibles. Definir el menú ES en XML, traducciones EU mediante `<record>` o `.po`.
- **Imágenes y vídeos con texto incrustado**: prohibidos. Todo texto debe ir como QWeb traducible. Excepción: logo (no lleva texto traducible).

### 4.3 Selector de idioma (switcher)

En header, esquina superior derecha junto al botón "Acceso clientes". Patrón: `ES | EU` con el activo subrayado. Cambia a la URL traducida equivalente (Odoo lo resuelve nativamente con `website.lang_url_for`).

### 4.4 Alcance de traducción por página (v1)

CLAUDE.md §11 decisión "Idiomas": «páginas corporativas fijas en los 2 idiomas; casos de éxito y contenidos largos pueden arrancar ES-only con traducción progresiva».

Aplicación en v1:
- **Bilingüe estricto**: home, 4 sectoriales, conócenos, trabaja con nosotros, contacto, header, footer, los 8 archetypes (textos cortos, traducibles).
- **ES-only**: `/kit-consulting` (D5).

---

## 5. Estructura de la home

8 secciones en orden funnel B2B (CLAUDE.md §11 decisión "Estructura de la home"). La tabla añade propósito B2B y jerarquía visual; no duplica nombres ya en §11.

| # | Snippet | Propósito B2B | Jerarquía visual dominante |
|---|---|---|---|
| 1 | `s_avanzosc_hero` | Captar atención + claim diferenciador. | H1 grande (Space Grotesk 64-72px), 2 CTAs. Espacio negativo amplio. |
| 2 | `s_avanzosc_pilares` | 3 razones para seguir leyendo (trayectoria, volumen, equipo). | 3 columnas iguales, números grandes (CLAUDE.md §9.8). |
| 3 | `s_avanzosc_sectores` | Filtrar self-selection del visitante hacia sectorial. | Grid 2x2 (industrial / distribución / servicios / academias). |
| 4a | `s_avanzosc_contador` | Cuantificar volumen técnico (600+ módulos). | Número editorial 100-120px (CLAUDE.md §9.8). |
| 4b | `s_avanzosc_timeline` | Demostrar trayectoria con hitos concretos. | Timeline horizontal en mobile, vertical en desktop. |
| 5 | `s_avanzosc_caso_exito` | Prueba social: lo que hacemos en proyectos reales. | Card grande con dashboard placeholder + KPIs (D3: uno fijo). |
| 6 | `s_avanzosc_equipo` | Diferenciador único: equipo STEM mayoritariamente femenino. | Grid de retratos con titulación (CLAUDE.md §9.1 pilar 3). |
| 7 | `s_avanzosc_cta_kit_consulting` | Hook para empresas elegibles del programa Red.es. | Banner full-width destacado, CTA secundario. |
| 8 | `s_avanzosc_cta_contacto` | Cierre del funnel. | Bloque centrado con tel + email + form simple. |

Bloque 4 visual = una sola sección en el DOM, con `s_avanzosc_contador` arriba y `s_avanzosc_timeline` debajo (CLAUDE.md §11 decisión "Estructura de la home").

---

## 6. Inventario de snippets

10 snippets v1 (los 9 de CLAUDE.md §8 + `s_avanzosc_sector_specifics` por D1). Todos privados del módulo (D4: no registrados en builder).

### 6.1 `s_avanzosc_hero`

- **XML**: `views/snippets/hero.xml`
- **SCSS**: `static/src/scss/snippets/_hero.scss`
- **JS**: `static/src/js/snippets/hero.js` (entrada orquestada GSAP + Splitting.js)
- **Deps externas**: GSAP 3, ScrollTrigger, Splitting.js (MIT)
- **Estado**: a crear
- **Reutilización**: home (sección 1) + cada sectorial (instancia con copy adaptado)

### 6.2 `s_avanzosc_pilares`

- **XML**: `views/snippets/pilares.xml`
- **SCSS**: `static/src/scss/snippets/_pilares.scss`
- **JS**: `static/src/js/snippets/pilares.js` (reveal-on-scroll por columna)
- **Deps externas**: IntersectionObserver nativo
- **Estado**: a crear (NUEVO según CLAUDE.md §11 decisión "Estructura de la home")
- **Reutilización**: home (sección 2)

### 6.3 `s_avanzosc_sectores`

- **XML**: `views/snippets/sectores_grid.xml`
- **SCSS**: `static/src/scss/snippets/_sectores.scss`
- **JS**: `static/src/js/snippets/sectores.js` (hover micro-interactions)
- **Deps externas**: ninguna (CSS puro + IntersectionObserver para reveal)
- **Estado**: a crear
- **Reutilización**: home (sección 3)

### 6.4 `s_avanzosc_contador`

- **XML**: `views/snippets/contador_modulos.xml`
- **SCSS**: `static/src/scss/snippets/_contador.scss`
- **JS**: `static/src/js/snippets/contador.js` (interpolación al entrar en viewport)
- **Deps externas**: IntersectionObserver nativo (CLAUDE.md §5)
- **Estado**: a crear
- **Reutilización**: home (sección 4a)

### 6.5 `s_avanzosc_timeline`

- **XML**: `views/snippets/timeline_trayectoria.xml`
- **SCSS**: `static/src/scss/snippets/_timeline.scss`
- **JS**: `static/src/js/snippets/timeline.js` (scroll progress + parallax sutil)
- **Deps externas**: GSAP 3 + ScrollTrigger
- **Estado**: a crear
- **Reutilización**: home (sección 4b)
- **Datos**: hitos hardcoded en QWeb (CLAUDE.md §9.1 pilar 1: 2008 TinyERP → 2024 Kit Consulting → hoy 600+ módulos)

### 6.6 `s_avanzosc_caso_exito`

- **XML**: `views/snippets/caso_exito.xml`
- **SCSS**: `static/src/scss/snippets/_caso_exito.scss`
- **JS**: `static/src/js/snippets/caso_exito.js` (reveal + parallax dashboard)
- **Deps externas**: IntersectionObserver nativo
- **Estado**: a crear
- **Reutilización**: home (sección 5, fija vía `ir.config_parameter` D3) + sectoriales (filtrada por sector, 1-2 archetypes por página)
- **Diseño anonymous-first** (CLAUDE.md §11 decisión "Casos de éxito destacados"): sin logo, sin nombre real, sin métrica inventada; visual = dashboard Odoo anonimizado o ilustración abstracta. La estructura del template debe permitir promoción a "nombrado" sin tocar markup (campos `name`, `logo` opcionales).

### 6.7 `s_avanzosc_equipo`

- **XML**: `views/snippets/equipo.xml`
- **SCSS**: `static/src/scss/snippets/_equipo.scss`
- **JS**: `static/src/js/snippets/equipo.js` (hover sobre retrato → detalle, reveal staggered)
- **Deps externas**: GSAP 3 (stagger entrada)
- **Estado**: a crear
- **Reutilización**: home (sección 6)
- **Datos**: lista de personas hardcoded en QWeb v1. Migración futura a `hr.employee` con campo `x_avanzosc_show_on_website` **[propuesta v2 — pendiente validación]**.

### 6.8 `s_avanzosc_cta_kit_consulting`

- **XML**: `views/snippets/cta_kit_consulting.xml`
- **SCSS**: `static/src/scss/snippets/_cta_kit_consulting.scss`
- **JS**: ninguno
- **Deps externas**: ninguna
- **Estado**: a crear
- **Reutilización**: home (sección 7) + landing `/kit-consulting`

### 6.9 `s_avanzosc_cta_contacto`

- **XML**: `views/snippets/cta_contacto.xml`
- **SCSS**: `static/src/scss/snippets/_cta_contacto.scss`
- **JS**: `static/src/js/snippets/cta_contacto.js` (validación form básica + reveal)
- **Deps externas**: ninguna (form HTML5 nativo + endpoint Odoo `/website_form/...`)
- **Estado**: a crear (NUEVO según CLAUDE.md §11 decisión "Estructura de la home")
- **Reutilización**: home (sección 8) + cierre de cada sectorial + página `/contacto`

### 6.10 `s_avanzosc_sector_specifics`

- **XML**: `views/snippets/sector_specifics.xml`
- **SCSS**: `static/src/scss/snippets/_sector_specifics.scss`
- **JS**: `static/src/js/snippets/sector_specifics.js` (reveal sencillo)
- **Deps externas**: IntersectionObserver nativo
- **Estado**: a crear (NUEVO según D1 de esta sesión)
- **Reutilización**: cada una de las 4 sectoriales, con contenido inyectado vía atributos QWeb del `<t t-call>` (título sectorial, lista de items, ilustración).

---

## 7. Páginas sectoriales

4 páginas: industrial, distribución, servicios, academias. Estructura común (D1):

```
1. Hero sectorial (instancia de s_avanzosc_hero con copy adaptado al sector)
2. Subsectores del sector (QWeb estático por página, no es snippet)
3. s_avanzosc_sector_specifics (bloque propio, contenido por sector)
4. s_avanzosc_caso_exito × 1-2 (filtrado por sector)
5. s_avanzosc_cta_contacto
```

### 7.1 Subsectores por página (QWeb estático)

Lista coherente con CLAUDE.md §2:

- **Industrial**: fabricación, química, alimentaria, mecanizado, textil.
- **Distribución**: retail, ecommerce, mayoristas.
- **Servicios**: IT, SAT, despachos.
- **Academias**: centros educativos (escuelas, FP, academias privadas).

### 7.2 Contenido específico por sector (`s_avanzosc_sector_specifics`)

Cada sectorial inyecta un payload distinto en este snippet (D1):

- **Industrial**: «Tipos de fabricación que cubrimos» — discreta, por procesos, MRP por capacidad, OEE, trazabilidad lote/serie.
- **Distribución**: «Integraciones logísticas» — transportistas (SEUR, MRW, etc.), marketplaces (Amazon, eBay), EDI con cadenas.
- **Servicios**: «Gestión de proyectos y partes de horas» — `project`, `hr_timesheet`, facturación por hora/proyecto, helpdesk con SLA.
- **Academias**: «Comunicación con familias» — portal padres/madres, notificaciones automáticas, calendario académico, pagos online.

### 7.3 Archetypes filtrados por página

- **Industrial**: archetypes 1-4 (los 4 industriales de CLAUDE.md §11). 1-2 destacados por defecto.
- **Distribución**: archetypes 5-6.
- **Servicios**: archetype 7.
- **Academias**: archetype 8.

Selección por defecto vía `ir.config_parameter` `website_avanzosc_demo.featured_archetypes_<sector>` (lista de IDs). Mismo patrón que D3.

---

## 8. Header y footer

### 8.1 Header

Layout (de izquierda a derecha):

```
[Logo] [Inicio] [Soluciones sectoriales ▾] [Tienda] [Formación] [Conócenos] [Trabaja con nosotros] [Contacto]    [ES|EU]    [Acceso clientes]
```

- **Logo**: SVG (CLAUDE.md §11 pendiente: SVG vectorizar). Versión sobre fondo claro por defecto. Linka a `/`.
- **Menú**: estructura de CLAUDE.md §2. Implementado vía `website.menu` en `data/menu.xml` para que sea editable desde Settings sin tocar código si fuera urgente; orden e items se versionan en XML.
- **Soluciones sectoriales**: dropdown con las 4 sectoriales.
- **Switcher idioma**: ES|EU, activo subrayado, cambia a URL traducida.
- **Acceso clientes**: botón destacado, color `--brand-primary` (CLAUDE.md §9.3). URL: `/web/login` por defecto **[propuesta — pendiente validar contra CLAUDE.md §11 decisión pendiente "Portal ERP actual"]**.
- **Sticky** al scroll: header reduce padding y opacidad de fondo aumenta tras 80px de scroll. GSAP ScrollTrigger.

#### Mobile breakpoint

- **≥992px** (Bootstrap `lg+`): menú completo visible con dropdown de "Soluciones sectoriales", switcher `ES|EU` y botón "Acceso clientes" en barra horizontal.
- **<992px** (Bootstrap `md-`): hamburger lateral. Al abrirlo, overlay con menú vertical + switcher `ES|EU` dentro (no visible en barra). Botón "Acceso clientes" se mantiene visible en la barra como **icono de usuario** (Lucide `user`), no como botón con texto.
- Razón: 992px es el corte estándar de Bootstrap 5 para "desktop nav vs mobile burger". El submenú sectorial dropdown no escala bien en tablet pequeña.

### 8.2 Footer

3 columnas + barra inferior:

```
COL 1: Avanzosc                 COL 2: Soluciones              COL 3: Contacto
- Conócenos                     - Industrial                   - Tel: 943 026 902
- Trabaja con nosotros          - Distribución                 - Email: comercial@avanzosc.es
- Contacto                      - Servicios                    - Av. Julio Urkijo 34 bajo
                                - Academias                      20720 Azkoitia, Gipuzkoa

──────────────────────────────────────────────────────────────────────────────────
© 2026 Avanzosc S.L. · CIF B20875340 · Aviso legal · Política de privacidad · Cookies
```

Datos legales **confirmados vigentes** (sesión 2026-04-27): CIF B20875340, Av. Julio Urkijo 34 bajo (20720 Azkoitia, Gipuzkoa), 943 026 902, comercial@avanzosc.es. Eliminar el item de CLAUDE.md §11 "Decisiones pendientes" en el commit que mueve D1-D6.

---

## 9. Animaciones y UX

Principios y prohibiciones: ver CLAUDE.md §5. Esta sección concreta versiones, qué snippets son protagonistas y dependencias externas.

### 9.1 Librerías y versiones

| Librería | Versión | CDN | Snippets que la usan |
|---|---|---|---|
| GSAP | 3.12.5 | `cdnjs.cloudflare.com` | hero, timeline, equipo |
| GSAP ScrollTrigger | 3.12.5 | `cdnjs.cloudflare.com` | timeline, header sticky |
| Splitting.js | 1.0.6 (última estable conocida; verificar al integrar) | `cdn.jsdelivr.net` (MIT) | hero |
| Lenis | 1.0.42 | `cdn.jsdelivr.net` (MIT) | global (smooth scroll) |
| Swiper | 11.x | `cdn.jsdelivr.net` (MIT) | reservado v2; **no** se carga en v1 si ningún snippet lo usa |
| Lucide Icons | 0.453.x | `cdn.jsdelivr.net` (ISC) | global (iconografía CLAUDE.md §9.7) |

**Nota**: se descartó GSAP SplitText (Club GreenSock, de pago) en favor de Splitting.js (MIT) — funcionalmente equivalente para split por palabra/letra, sin coste de licencia. Decisión de sesión 2026-04-27.

### 9.2 Animaciones destacadas por snippet

- **`s_avanzosc_hero`**: title con Splitting.js (split por letra) animado vía GSAP (stagger 30ms, ease-out expo, total ≤800ms — CLAUDE.md §11 decisión "Claim de la home") → subtítulo fade+slide 12px (300ms, delay 600ms) → CTAs fade (300ms, delay 900ms).
- **`s_avanzosc_contador`**: interpolación 0 → 600 al entrar en viewport (1.2s, ease-out cubic). Solo se anima la primera vez.
- **`s_avanzosc_timeline`**: ScrollTrigger marca progreso del año actual; parallax sutil ≤30% sobre fondos (CLAUDE.md §5).
- **`s_avanzosc_equipo`**: stagger entrada de retratos (60ms entre cada uno, ease-out expo).
- **Resto de snippets**: reveal-on-scroll básico con IntersectionObserver (`opacity 0 → 1` + `translateY(20px) → 0`, 600ms, ease-out expo).

### 9.3 Reglas no negociables ya definidas

`prefers-reduced-motion`, animar solo `transform/opacity`, no scrolljacking, etc. → CLAUDE.md §5. No re-explicar aquí.

---

## 10. Catálogo de los 8 archetypes

8 archetypes anónimos de CLAUDE.md §11 decisión "Casos de éxito destacados". Esta tabla añade un sugerido para "capacidad funcional a destacar" — todos marcados **[propuesta — pendiente validar copy]** porque CLAUDE.md §11 prohíbe métricas inventadas. La capacidad debe redactarse como funcionalidad técnica, no como cifra.

| # | Sector | Archetype | Capacidad a destacar (no métrica numérica) |
|---|---|---|---|
| 1 | Industrial | Metalúrgico/mecanizado exportador | MRP por capacidad finita + configurador multivariante + multidivisa con tipo de cambio diario. |
| 2 | Industrial | Química con trazabilidad batch + ADR | Vencimientos automáticos + fichas de seguridad versionadas + presentación SILICIE. |
| 3 | Industrial | Alimentaria con AECOC + balanzas | Trazabilidad lote/alérgenos en milisegundos + integración nativa con balanzas de envasado. |
| 4 | Industrial | Textil con temporadas y OEMs | Variantes talla-color con grid + planificación PV/OI + producción para terceros. |
| 5 | Distribución | Retail multitienda + ecommerce | POS multitienda con stock en tiempo real + sync ecommerce + devoluciones omnicanal. |
| 6 | Distribución | Mayorista catálogo masivo | Configurador de producto + listas de precios por cliente + EDI con cadenas. |
| 7 | Servicios | IT/SAT con técnicos en ruta | Helpdesk con SLA + planning geolocalizado + facturación recurrente automática. |
| 8 | Academias | Grupo educativo multicentro | Matriculación online + gestión académica multicentro + comunicación con familias. |

Anonimización: todos los archetypes muestran "Empresa industrial del Norte de España" o similar. Sin nombres, sin logos, sin fotos de instalaciones reales (CLAUDE.md §9.6: stock photos prohibidas → usar dashboards Odoo anonimizados o ilustraciones abstractas).

---

## 11. Plan de redirects 301

Convivencia y switchover: D6. La web nueva vive en `nueva.avanzosc.es` durante desarrollo y QA. En el switchover al dominio principal, las URLs antiguas redirigen a las equivalentes nuevas con 301.

Mapeo de URLs antiguas más relevantes detectables del avanzosc.es actual **[propuesta — verificar mapa real con auditoría SEO antes del switchover]**. Implementación: tabla `data/redirects.xml` con `<record model="website.rewrite">` por entrada.

| Antigua | Nueva | Notas |
|---|---|---|
| `/` | `/` | Sin cambio. |
| `/page/contactenos` | `/contacto` | URL Odoo genérica → slug propio. |
| `/page/sobre-nosotros` | `/conocenos` | Renombrado per CLAUDE.md §2. |
| `/page/cursos` | `/slides` | Old slug Odoo → URL real Odoo. |
| `/formacion` | `/slides` | Slug "bonito" expuesto por el menú v1 (CLAUDE.md §2 "Formación"). 301 a la URL real Odoo. |
| `/shop` | `/shop` | URL real Odoo; sin cambio. |
| `/tienda` | `/shop` | Slug "bonito" expuesto por el menú v1 (CLAUDE.md §2 "Tienda"). 301 a la URL real Odoo. |
| `/blog` | `/` (con flash message) o 410 Gone | CLAUDE.md §11 decisión "Blog": fuera. **[?] ¿301 a home o 410 Gone?** |
| `/blog/categoria/*` | idem | Misma decisión. |
| `/page/industria-4-0` o similar | `/industrial` | Soluciones de fabricación → sectorial industrial. |
| `/page/retail` | `/distribucion` | |
| `/page/servicios-it` | `/servicios` | |
| `/page/educacion` | `/academias` | |
| `/page/kit-digital` | `/kit-consulting` | Programa equivalente vigente. **[?] ¿mantener `/kit-digital` activa o redirigir?** |

Auditoría SEO previa al switchover (Screaming Frog o equivalente) detectará URLs adicionales. **No se hace mapeo exhaustivo de artículos individuales de blog** (D6).

**Compromiso v1 sobre `/tienda` y `/formacion`** (sesión 2026-04-27): el menú v1 expone los slugs "bonitos" `/tienda` y `/formacion`. Al hacer clic, el navegador hace 301 a la URL real Odoo (`/shop`, `/slides`). **El usuario verá la URL real en la barra de direcciones tras el redirect**, no `/tienda` ni `/formacion`. La opción de heredar `WebsiteSale` y `WebsiteSlides` para que las URLs reales sean directamente `/tienda` y `/formacion` (sin redirect) queda **explícitamente diferida a v2 o más allá** — requiere override de controllers de módulos core, fuera del alcance de v1.

---

## 12. Convivencia temporal y switchover

### 12.1 Fase de desarrollo y QA

- Subdominio: `nueva.avanzosc.es`. **Decisión (sesión 2026-04-27): mismo Odoo `odoo14_community` con `website` adicional.** Se configura un segundo `website.website` con `domain = nueva.avanzosc.es`; comparte BD, tienda y formación se ven igual desde ambos. Al switchover basta cambiar el `domain` del website nuevo a `avanzosc.es` y el viejo a un dominio archivado. Razón: evita sincronización de datos entre instancias y simplifica el switchover. Se asume que QA no necesita aislamiento destructivo en v1.
- DNS: `nueva.avanzosc.es` → IP del servidor actual o staging.
- `robots.txt` del subdominio: `Disallow: /` para que Google no indexe la versión en pruebas.

### 12.2 Switchover al dominio principal

Pasos en orden:
1. Validación final por equipo Avanzosc en `nueva.avanzosc.es`.
2. Backup de la BD `odoo14_community`.
3. Cambio del `website.domain` del website nuevo a `avanzosc.es`.
4. Activación de redirects 301 (§11 de este spec).
5. Quitar `Disallow: /` del `robots.txt`, regenerar sitemap.
6. Notificar a Google Search Console del cambio.
7. Monitor de errores 404 durante 30 días post-switchover.

---

## 13. Preguntas abiertas

Resolver antes de las fases en las que cada una bloquea.

1. **[?] EU slugs no sectoriales** (`/eu/ezagutu-gaitzazu`, `/eu/lan-egin-gurekin`, `/eu/kontaktua`). Validación lingüística por equipo Avanzosc. Bloquea creación de páginas bilingües.
2. **[?] Botón "Acceso clientes"**. ¿`/web/login` estándar o URL custom de portal? CLAUDE.md §11 decisión pendiente. Bloquea header.
3. **[?] Hex exactos del logo + SVG**. CLAUDE.md §11 decisiones pendientes. Bloquean SCSS variables y header/footer brand visual.
4. **[?] Analytics**. GA4, Plausible, Matomo o ninguno. CLAUDE.md §11 decisión pendiente. Bloquea integración en `views/layout.xml`.
5. **[?] `/blog/*` post-switchover**: 301 a home, 410 Gone o landing «archivado». Mejor para SEO depende del tráfico real del blog. Bloquea redirects. Se resolverá con auditoría SEO real antes del switchover.
6. **[?] `/kit-digital` antiguo**: ¿se mantiene activa porque sigue habiendo prospects con el programa antiguo, o se redirige a `/kit-consulting`? Depende del estado real del programa Red.es a fecha del switchover. Bloquea redirects.
7. **[?] Caso de éxito en home (D3) — selección inicial**. ¿Qué archetype del 1-8 va por defecto? Recomendación: archetype 1 (industrial metalúrgico exportador) por ser el sector ancla. Bloquea poblar `ir.config_parameter` inicial.
8. **[?] Sesión fotográfica del equipo**. CLAUDE.md §9.6 prioriza fotos reales. ¿Existe sesión planificada o usamos placeholders en v1 con plan de sustitución? Bloquea `s_avanzosc_equipo` con fotos finales.

---
