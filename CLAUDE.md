Nunca operar sobre GitHub (push, branches, PRs, settings, releases) sin autorización explícita en la sesión actual. Las autorizaciones son puntuales y NO se heredan entre sesiones.
# Proyecto: Web corporativa `website_avanzosc_demo`

Rediseño completo de **avanzosc.es**. Avanzosc S.L. es una consultora de Odoo fundada en 2008, con sede en Azkoitia (Gipuzkoa). El objetivo es sustituir la web actual (tema Odoo genérico) por una web moderna, con personalidad de marca, que capitalice los diferenciadores reales de la empresa y funcione como canal de captación B2B.

Stack: **módulo custom sobre Odoo 14 Community**, instalación nativa.

---

## 1. Arquitectura global

Enfoque **todo dentro de Odoo**, tema custom sobre `website`:

- **Web corporativa** (inicio, soluciones sectoriales, conócenos, trabaja con nosotros, contacto) → módulo `website_avanzosc_demo`.
- **Tienda** → `website_sale` existente, re-skineada con el tema.
- **Formación** → `website_slides` existente, re-skineada.
- **Portal ERP de clientes** → `portal` estándar, acceso desde botón "Acceso clientes" en header.

Mismo dominio, mismo servidor, mismo Odoo.

---

## 2. Estructura de navegación (nueva)

Menú principal:

Orden por prioridad de funnel B2B (decisión 2026-04-28): los 5 primeros
hasta Contacto son los high-conversion items del funnel; los 2 últimos
(Conócenos, Empleo) son secundarios y caen al overflow `[+]` a 992px
sin perjuicio de la UX desktop principal (≥1280 entran los 7).

1. **Inicio**
2. **Soluciones** (dropdown — renombrado desde «Soluciones sectoriales»;
   el adjetivo era redundante con el contenido del dropdown y consumía
   ancho del navbar):
   - Industrial (fabricación, química, alimentaria, mecanizado, textil)
   - Distribución (retail, ecommerce, mayoristas)
   - Servicios (IT, SAT, despachos)
   - Academias y centros educativos
3. **Tienda**
4. **Formación** (renombrado de "Cursos")
5. **Contacto**
6. **Conócenos**
7. **Empleo** (renombrado desde «Trabaja con nosotros»; estándar moderno
   corporativo, ahorra ancho. Slug interno `/trabaja-con-nosotros` se
   mantiene — etiqueta visible y URL son decisiones independientes;
   slug-rename es decisión de SEO posterior).

**Fuera del menú principal**:
- **Kit Consulting Red.es** → landing en `/kit-consulting`, banner temporal en home.
- **FAQ** → no como página separada; preguntas integradas en cada página de servicio.
- **Acceso clientes** → botón destacado arriba-derecha del header.

---

## 3. Stack técnico (Odoo 14)

**Frontend:**
- Bootstrap 5 (el que trae v14, no actualizar).
- SCSS compilado por el sistema de assets de Odoo.
- QWeb para templates (sintaxis v14, **no v15+**).
- JavaScript con `odoo.define(...)` (sistema legacy de v14). **NO usar ES6 modules** (`@odoo/x`).

**Librerías externas (CDN, no npm):**
- **GSAP 3** (+ ScrollTrigger, SplitText) → animaciones orquestadas.
- **Lenis** → smooth scroll.
- **IntersectionObserver nativo** → reveal-on-scroll. No usar AOS ni WOW.js.
- **Swiper** → sliders (verificar si ya está cargado por otro módulo antes de duplicar).

**Backend (cuando haga falta):**
- Python **3.10.12** en modelos custom (venv en `/opt/odoo/v14/venv/bin/python`).
- Aunque 3.10 permite sintaxis moderna (walrus operator, pattern matching, union types con `|`), **evitarla en módulos Odoo 14** para mantener consistencia con el core (escrito pensando en 3.6+). Usar estilo clásico Odoo.
- Heredar modelos existentes con `_inherit`, nunca reescribir.

---

## 4. Reglas de código NO NEGOCIABLES

### XML y vistas
- Toda modificación de vistas existentes con herencia `<xpath>`, nunca reescritura.
- Cada herencia con `inherit_id` explícito y comentario `<!-- -->` explicando el porqué.
- IDs prefijados: `website_avanzosc_demo.snippet_hero`, no `snippet_hero`.

### Assets
Registrar CSS/JS vía **herencia XML** de `web.assets_frontend`, no con el manifest moderno:
```xml
<template id="assets_frontend" inherit_id="web.assets_frontend">
    <xpath expr="." position="inside">
        <link rel="stylesheet" type="text/scss" href="/website_avanzosc_demo/static/src/scss/main.scss"/>
        <script type="text/javascript" src="/website_avanzosc_demo/static/src/js/main.js"/>
    </xpath>
</template>
```
**No usar** `'assets': {'web.assets_frontend': [...]}` del manifest — eso es v15+.

### SCSS
- Variables globales en `static/src/scss/_variables.scss`.
- Un SCSS por snippet/componente, importados desde `main.scss`.
- Sobrescribir variables de Bootstrap **antes** de importar, no después.

### JavaScript
```javascript
odoo.define('website_avanzosc_demo.hero', function (require) {
    'use strict';
    var publicWidget = require('web.public.widget');

    publicWidget.registry.AvanzoscHero = publicWidget.Widget.extend({
        selector: '.s_avanzosc_hero',
        start: function () {
            // ...
            return this._super.apply(this, arguments);
        },
    });
});
```
- `publicWidget` para comportamiento del frontend público.
- Sin `import/export` de ES6. Sin `class X extends Y` moderno de v15+.

### Snippets
- Cada snippet es un template QWeb en `views/snippets/`.
- Prefijo de clase CSS: `s_avanzosc_X`.
- Registro en el builder vía herencia de `website.snippets`.

### Modelos Python
- Heredar con `_inherit = 'model.name'`.
- Campos custom prefijados con `x_avanzosc_`.

---

## 5. Animaciones y UX

### Principios
- Animar **solo** `transform` y `opacity` (GPU). No animar `width`, `height`, `top`, `left`, `margin`.
- Respetar `prefers-reduced-motion`:
  ```scss
  @media (prefers-reduced-motion: reduce) {
      * { animation: none !important; transition: none !important; }
  }
  ```
- Duraciones: 300–600ms microinteracciones, 800–1200ms entradas grandes.
- Easings: `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out expo) entradas; `cubic-bezier(0.7, 0, 0.84, 0)` salidas.

### Patrones aprobados
- Reveal on scroll con IntersectionObserver.
- Hero con entrada orquestada: título SplitText de GSAP (letra a letra), subtítulo fade+slide, CTA con delay.
- Parallax sutil (≤30% desplazamiento) con GSAP ScrollTrigger.
- Smooth scroll con Lenis, respetando anchors internos.
- Contador animado para el "600+ módulos" en la home (IntersectionObserver + interpolación).

### Patrones prohibidos
- Pop-ups de cookies que cubren media pantalla.
- Carruseles automáticos sin pausa al hover.
- Texto letra a letra en párrafos largos (mata legibilidad).
- Scrolljacking (interceptar el scroll del usuario).

---

## 6. Flujo de trabajo con Claude Code

### MCPs disponibles
- `context7` → docs actualizadas. Antes de usar GSAP, Lenis, Bootstrap 5, Odoo 14 API, etc., invocar con "use context7".
- `playwright` → verificación visual. URL local: `http://localhost:14070`.
- `filesystem` → acceso a `/opt/odoo/v14/`.
- `odoo` → consultas a la instancia `odoo14_community` (solo lectura).

### Antes de cualquier cambio visual
1. Consultar el modelo real con MCP `odoo` si afecta a modelo existente.
2. Abrir la página con Playwright, screenshot "antes".
3. Picar el código.
4. Recargar y screenshot "después".
5. Verificar que no se ha roto nada adyacente (header, footer, otros snippets).

### Flujo para features nuevas
1. `/superpowers:brainstorm` → refinar antes de picar.
2. `/superpowers:write-plan` → plan por fases.
3. `/superpowers:execute-plan` → implementación con TDD y revisión.

### Flujo para cambios pequeños
Directo, pero con Playwright abierto para verificar.

---

## 7. Servidor Odoo local

- Instalación nativa en `/opt/odoo/v14/`.
- Venv Python: `/opt/odoo/v14/venv/bin/python` (Python 3.10.12).
- **Archivo de configuración**: `/etc/odoo/odoo14_community.conf` (NO `/opt/odoo/v14/odoo.conf`). Todos los comandos CLI deben usar `-c /etc/odoo/odoo14_community.conf`.
- Base de datos: `odoo14_community`.
- Puerto: `14070`.
- Working dir del módulo (fase experimental): `/opt/odoo/v14/workspace/website_avanzosc_demo`.
- Para que Odoo cargue el módulo desde aquí, el `addons_path` debe incluir esta ruta o existir un symlink desde un directorio ya presente en `addons_path`. Verificar en cada install/update.
- Arrancar SIEMPRE con `--dev=all`:
  ```bash
  /opt/odoo/v14/venv/bin/python /opt/odoo/v14/base/odoo-bin -c /etc/odoo/odoo14_community.conf --dev=all -d odoo14_community
  ```
- Tras añadir archivos nuevos o cambiar `__manifest__.py`:
  ```bash
  /opt/odoo/v14/venv/bin/python /opt/odoo/v14/base/odoo-bin -c /etc/odoo/odoo14_community.conf -u website_avanzosc_demo -d odoo14_community --stop-after-init
  ```

### Git
- **Repo activo (fase experimental)**: `github.com/AnerAvanzosc/website_avanzosc_demo` (público, fork personal del desarrollador).
- **Working dir local**: `/opt/odoo/v14/workspace/website_avanzosc_demo`.
- El **repo oficial de Avanzosc** (`github.com/avanzosc/odoo-addons`) **NO se toca** durante la fase experimental. Cuando el módulo madure, se decidirá si y cómo migrarlo (subtree, copia + PR, etc.).
- Commits pequeños, mensajes en inglés (convención OCA): `[ADD] website_avanzosc_demo: snippet hero with GSAP entrance animation`.
- Prefijos de commit (mapeo de uso para este proyecto):
  - `[ADD]` — añadir un módulo nuevo completo o un componente arquitectural mayor.
  - `[FEAT]` — implementar una tarea concreta del plan dentro de un módulo existente (uso principal durante v1).
  - `[FIX]` — corregir un bug detectado.
  - `[IMP]` — mejorar algo existente sin que sea bug ni feature nueva.
  - `[REF]` — refactor sin cambio de comportamiento.
  - `[REM]` — eliminar código.
  - `[MIG]` — migración entre versiones de Odoo.
  - `[DOC]` — solo documentación.
- Una rama por feature: `feature/home-hero`, `feature/timeline-trayectoria`, etc.
- **NO** commitear archivos generados: `.pyc`, `__pycache__/`, logs, `.vscode/`, `.idea/`. Verificar que el `.gitignore` del repo los cubre.

### MCPs del proyecto
El `.mcp.json` del módulo declara: `playwright`, `context7`, `fs-addons`, `odoo`.

#### Variables de entorno requeridas
El `.mcp.json` no lleva credenciales ni rutas absolutas hardcodeadas; todo se resuelve por **variables de entorno** que cada dev configura en su máquina. Hay un `.env.example` en la raíz con la lista completa y valores de muestra.

| Variable | Para qué | Ejemplo |
|---|---|---|
| `ODOO_URL` | URL de la instancia Odoo local | `http://localhost:14070` |
| `ODOO_DB` | Nombre de la base de datos | `odoo14_community` |
| `ODOO_USER` | Usuario Odoo (lectura para el MCP) | `admin` |
| `ODOO_PASSWORD` | Password de ese usuario | *(la tuya, NO commitear)* |
| `ODOO_ADDONS_PATH` | Ruta absoluta al directorio de addons que el MCP `fs-addons` puede leer | `/opt/odoo/v14/github/avanzosc/odoo-addons` |

Dos formas válidas de configurarlas:

1. **`.bashrc` / `.zshrc`** (export persistente):
   ```bash
   export ODOO_URL=http://localhost:14070
   export ODOO_DB=odoo14_community
   export ODOO_USER=admin
   export ODOO_PASSWORD=tu-password-real
   export ODOO_ADDONS_PATH=/opt/odoo/v14/github/avanzosc/odoo-addons
   ```

2. **Fichero `.env` local en la raíz del módulo** (cargado manualmente al lanzar Claude Code, p.ej. `set -a && source .env && set +a && claude`). El `.gitignore` ya bloquea `.env` y `.env.*`, así que no hay riesgo de commitear credenciales.

Si falta `ODOO_PASSWORD` o `ODOO_ADDONS_PATH`, los MCPs `odoo` y `fs-addons` arrancan rotos. El `.env.example` es el contrato — actualízalo cuando añadas variables nuevas.

---

## 8. Estructura de carpetas

```
website_avanzosc_demo/
├── __init__.py
├── __manifest__.py
├── data/
│   └── snippets.xml
├── views/
│   ├── assets.xml
│   ├── layout.xml
│   ├── pages/
│   │   ├── home.xml
│   │   ├── industrial.xml
│   │   ├── distribucion.xml
│   │   ├── servicios.xml
│   │   ├── academias.xml
│   │   ├── conocenos.xml
│   │   ├── trabaja_con_nosotros.xml
│   │   ├── contacto.xml
│   │   └── kit_consulting.xml
│   └── snippets/
│       ├── hero.xml
│       ├── pilares.xml
│       ├── contador_modulos.xml
│       ├── timeline_trayectoria.xml
│       ├── sectores_grid.xml
│       ├── sector_specifics.xml
│       ├── equipo.xml
│       ├── caso_exito.xml
│       ├── cta_kit_consulting.xml
│       └── cta_contacto.xml
├── static/
│   ├── src/
│   │   ├── scss/
│   │   │   ├── _variables.scss
│   │   │   ├── _mixins.scss
│   │   │   ├── _typography.scss
│   │   │   ├── main.scss
│   │   │   └── snippets/
│   │   ├── js/
│   │   │   ├── main.js
│   │   │   └── snippets/
│   │   └── img/
│   └── description/
│       └── icon.png
└── models/
```

---

## 9. Identidad de marca y visual

### 9.1 Posicionamiento

**Claim candidato**: *"17 años convirtiendo Odoo en la ventaja competitiva de la industria."*
(Variantes a testar: *"Odoo industrial de verdad, desde 2008."* / *"Los veteranos de Odoo en España."*)

**Tres pilares diferenciadores** que deben aparecer en la home sí o sí:

1. **Trayectoria**: *Desde 2008. Desde OpenERP. Antes incluso de que se llamara Odoo.* → timeline visual con hitos: 2008 TinyERP, 2010 co-organizadores Jornadas OpenERP Bilbao, 2012 Jornadas Donosti, 2014 nace Odoo + OdooMRP, 2019 grupo 7 colegios, 2022 Kit Digital, 2024 Kit Consulting, hoy 600+ módulos.

2. **Volumen técnico real**: *600+ módulos desarrollados, contribuidores activos de OCA.* → contador animado + grid de apps/módulos destacados.

3. **Equipo único**: *Un equipo STEM mayoritariamente femenino liderando Odoo industrial.* → sección de equipo con fotos reales, titulación y especialidad técnica (matemáticas, telecos, informática, gestión). Esto es un activo de marca real que la competencia no puede copiar.

### 9.2 Tono de voz

**Cercano, técnico, honesto, con orgullo local.**

- Tuteo por defecto (*"te ayudamos"*, *"tu empresa"*).
- Términos técnicos usados con precisión, sin disimular: *"migración OpenUpgrade"*, *"módulos OCA"*, *"localización fiscal española"*. El target sabe lo que es o debería.
- Frases cortas. Mucho punto. Pocos gerundios.
- Cero palabrería tipo *"soluciones 360º"*, *"sinergias"*, *"transformamos tu negocio"*. Banned.
- Guiños sutiles al arraigo vasco cuando encaje, sin forzar. Los nombres del equipo ya hacen parte del trabajo.
- Humor seco permitido en microcopies (*"FAQ: porque siempre hay alguien que pregunta primero"*).

### 9.3 Paleta de color

> ⚠️ **Pendiente**: extraer los hex exactos del logo actual (`https://avanzosc.es/web/image/website/1/logo/Avanzosc`). Descargarlo, abrirlo en cualquier selector de color (Figma, macOS Color Meter, o `convert logo.png -resize 1x1 txt:` con ImageMagick), y **actualizar esta tabla** antes de comenzar el tema.

**Propuesta inicial** (refinar tras extraer del logo):

| Rol | Hex propuesto | Uso |
|-----|--------------|-----|
| `--brand-primary` | `#E85D2F` | CTAs principales, acentos, links hover |
| `--brand-primary-dark` | `#C44015` | Hover de primary, cabeceras fuertes |
| `--brand-secondary` | `#1B2A41` | Headlines, header, footer |
| `--brand-accent` | `#F5B800` | Highlights puntuales, badge "Kit Digital" |
| `--neutral-900` | `#0F1419` | Texto principal |
| `--neutral-700` | `#3A4149` | Texto secundario |
| `--neutral-500` | `#7A828B` | Metadatos, fechas, labels |
| `--neutral-300` | `#D3D7DC` | Bordes, separadores |
| `--neutral-100` | `#F4F5F7` | Fondos de sección alternos |
| `--neutral-0` | `#FFFFFF` | Fondo base |
| `--success` | `#2D8B57` | Confirmaciones |
| `--danger` | `#C73E3E` | Errores |

**Modo oscuro**: opcional en v2. Priorizar modo claro bien hecho primero.

### 9.4 Tipografía

**Display (headings)**: `Space Grotesk` (Google Fonts, gratis). Moderno + técnico sin ser frívolo.

**Body**: `Inter` (Google Fonts, gratis, variable font).

**Mono (código, datos, labels técnicos)**: `JetBrains Mono` (gratis).

**Jerarquía**:
- H1: 56-72px Space Grotesk, -0.02em letter-spacing, peso 600.
- H2: 40-48px Space Grotesk, peso 500.
- H3: 28-32px Space Grotesk, peso 500.
- Body: 18px Inter, line-height 1.65.
- Small: 14px Inter, peso 500, tracking +0.02em.

**Prohibido**: combinar dos display. Times/Georgia con Space Grotesk. Fuentes de sistema (Arial, Helvetica) como principal.

### 9.5 Logo

**Actual**: `https://avanzosc.es/web/image/website/1/logo/Avanzosc` (PNG).

**A preparar antes del desarrollo**:
- SVG vectorial limpio (el actual es bitmap; no vale para web moderna).
- Versión horizontal + versión compacta/isotipo.
- Versión sobre fondo claro + sobre fondo oscuro.
- Favicon 32x32 y 16x16, PNG transparente + ICO.
- Apple touch icon 180x180.

Si no hay SVG, **vectorizar antes de picar código**. No merece la pena arrancar con un logo pixelado.

### 9.6 Estilo fotográfico

**Prioridad 1 — Fotografía real del equipo.** Las fotos actuales están desactualizadas y con calidades inconsistentes. Sesión profesional pendiente: estilo reportaje, luz natural, sin fondos blancos de estudio. Se les ve trabajando, conversando, pensando. Nada de brazos cruzados corporate.

**Prioridad 2 — Sector industrial real.** En vez de stock photos de "ingeniero con tablet", fotos de clientes reales (con permiso) en su fábrica, almacén, taller. Planificar que las fotos nuevas salgan de visitas comerciales futuras.

**Prioridad 3 — Evitar stock photos obvios.** Si hay que usar stock: Unsplash/Pexels con criterio. NUNCA Shutterstock estándar. Preferir capturas reales de Odoo (dashboards, reports) personalizadas para clientes (anonimizadas) antes que stock malo.

**No usar**:
- Stock photos de "oficina moderna diáfana".
- Handshakes.
- Gráficas 3D genéricas flotando.
- Mockups de iPhone/MacBook con captura borrosa.

### 9.7 Iconografía

**Lucide Icons** (SVG, gratis, consistente, moderno) para todo el sistema. No mezclar con FontAwesome ni emojis en la UI.

### 9.8 Principios de composición

- **Asimetría controlada**. Romper el grid en momentos puntuales (hero, transiciones) pero mantener rejilla base en contenido denso.
- **Espacio negativo generoso**. La web actual sufre de claustrofobia — este rediseño corrige eso.
- **Densidad variable**. Alternar secciones respiradas con secciones densas de datos (ej: timeline 2008-2024 más densa; hero y CTAs muy respirados).
- **Jerarquía por tamaño antes que por color**. Los headlines mandan por tamaño + tipografía, no por pintarlos de naranja.
- **Números grandes**. El "600+" y "17 años" son activos — tratarlos como tal (80-120px, display tipo editorial).

---

## 10. Lo que NO hacer (recordatorios finales)

- **NO** tocar el Website Builder visual. Todo por código.
- **NO** modificar archivos dentro de `/opt/odoo/v14/odoo/addons/` (core). Solo heredar.
- **NO** añadir `package.json` ni dependencias npm al módulo. Librerías por CDN.
- **NO** usar sintaxis de Odoo 15+ (ES6 modules, manifest assets). Estamos en v14.
- **NO** guardar credenciales ni API keys en el código. `ir.config_parameter` o variables de entorno.
- **NO** commitear datos reales de clientes en casos de éxito de prueba. Datos ficticios hasta aprobación del cliente.
- **NO** replicar la estructura densa de párrafos de la web actual. La nueva va a tener ~30% del texto actual y triple de impacto.

---

## 11. Decisiones pendientes (a resolver en el brainstorm)

Esta sección se actualiza según se toman decisiones. Claude debe preguntar por estos puntos si la tarea las requiere y aún no están resueltas.

### Decisiones ya tomadas ✓

- [x] **Módulos website-* a instalar**: `website`, `website_sale`, `website_slides`. `portal`, `mail` y `web_editor` entran como dependencias automáticas. **Ya instalados en `odoo14_community`.**
  - `website_blog` quedó instalado en BD de la ronda anterior pero NO se declara en `depends` de `website_avanzosc_demo`. Queda residual e invisible al no tener menú ni enlaces; si en v2 se decide retomar el canal, basta con reactivar.
- [x] **Arquitectura**: todo dentro del mismo Odoo, tema custom sobre `website`.
- [x] **Nombre del módulo**: `website_avanzosc_demo`.
- [x] **Repo y ruta** (fase experimental): `github.com/AnerAvanzosc/website_avanzosc_demo`, working dir `/opt/odoo/v14/workspace/website_avanzosc_demo`. El repo oficial `github.com/avanzosc/odoo-addons` NO se toca durante esta fase.
- [x] **Idiomas**: ES + EU. `website.language_ids = [es_ES, eu_ES]`, URL raíz ES (sin prefijo) + `/eu/`. Páginas corporativas fijas en los 2 idiomas; casos de éxito y contenidos largos pueden arrancar ES-only con traducción progresiva. **Validación**: turno del usuario (2026-04-27) tras presentar A/B/C/D: «hagamos el B».
- [x] **Claim de la home**: «Odoo industrial de verdad, desde 2008.» (opción B de §9.1). EU: «Benetako Odoo industriala, 2008tik.». Encaja con SplitText sin sobrepasar 800ms y con tono §9.2 (frases cortas, cero palabrería). El activo "17 años" se traslada al contador animado y/o timeline en lugar de aparecer en el H1. **Validación**: turno del usuario (2026-04-27) tras presentar A/B/C/D: «b».
- [x] **Estructura de la home**: 8 secciones visuales en orden funnel B2B (Approach B), con 9 snippets QWeb:
  1. Hero (claim + 2 CTAs) — `s_avanzosc_hero`.
  2. Tres pilares (Desde 2008 / 600+ módulos OCA / Equipo STEM) — `s_avanzosc_pilares`.
  3. Grid de sectores (Industrial · Distribución · Servicios · Academias) — `s_avanzosc_sectores`.
  4. Trayectoria + volumen (bloque combinado): `s_avanzosc_contador` (600+) sobre `s_avanzosc_timeline` (hitos 2008→hoy de §9.1).
  5. Caso de éxito destacado — `s_avanzosc_caso_exito`.
  6. Equipo (fotos reales + titulación + especialidad) — `s_avanzosc_equipo`.
  7. CTA Kit Consulting — `s_avanzosc_cta_kit_consulting`.
  8. CTA contacto final (teléfono + email + botón) — `s_avanzosc_cta_contacto`.

  **Snippets nuevos a crear** (ya añadidos a §8): `s_avanzosc_pilares`, `s_avanzosc_cta_contacto`.
  **Validación**: turno del usuario (2026-04-27) tras presentar A/B/C: «b».

- [x] **Casos de éxito destacados**: catálogo inicial de 8 archetypes anónimos (sin nombres reales, sin fotos reales, sin métricas reales — Avanzosc aún no tiene los datos consolidados). Cobertura por sector:
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
- [x] **Blog**: FUERA del sitio. `website_blog` NO se añade a `depends` de `website_avanzosc_demo`. Ni menú, ni link, ni snippet en home. El módulo `website_blog` queda residual en BD (instalado por ronda anterior) pero invisible al visitante. Reversible: el día que Avanzosc decida activar el canal con persona dedicada, basta con añadir el módulo a `depends` y estilizar plantillas. **Validación**: turno del usuario (2026-04-27) tras presentar A/B/C: «no quiero blogs, fuera fuear».

#### Decisiones derivadas de la revisión del design spec (sesión 2026-04-27)

Las 6 decisiones siguientes (D1-D6) se cerraron en la sesión de revisión del spec, posterior al brainstorm original. Detalle técnico completo en `docs/superpowers/specs/2026-04-27-website-avanzosc-demo-design.md` §2.

- [x] **D1 — Estructura común de páginas sectoriales**: cada sectorial sigue el patrón `hero sectorial · subsectores (QWeb estático) · s_avanzosc_sector_specifics · 1-2 archetypes filtrados · s_avanzosc_cta_contacto`. Bloque propio por sector: industrial→tipos de fabricación, distribución→integraciones logísticas, servicios→gestión de proyectos, academias→comunicación con familias. **Snippet nuevo añadido** a §8: `sector_specifics.xml`. **Validación**: turno del usuario (2026-04-27) en revisión del spec: «Sectoriales — patrón común con bloque específico por sector. Estructura base como propones (hero + subsectores + archetypes filtrados + CTA), añadiendo un bloque propio a mitad de página por sectorial […]».
- [x] **D2 — Slugs URL EU traducidos al euskera**: bajo `/eu/`, los 4 slugs sectoriales son `/eu/industriala/`, `/eu/banaketa/`, `/eu/zerbitzuak/`, `/eu/akademiak/`. Slugs no sectoriales (conócenos, contacto, etc.) pendientes de validación lingüística por equipo Avanzosc — listados en preg. abierta del spec. **Validación**: turno del usuario (2026-04-27): «Slugs traducidos al euskera bajo /eu/. /eu/industriala/, /eu/banaketa/, /eu/zerbitzuak/, /eu/akademiak/».
- [x] **D3 — Caso de éxito en home — selección configurable**: uno fijo, seleccionado vía `ir.config_parameter` `website_avanzosc_demo.featured_archetype_id`. Mismo patrón aplicable a sectoriales (`featured_archetypes_<sector>`). **Validación**: turno del usuario (2026-04-27): «Caso de éxito en home: uno fijo configurable vía ir.config_parameter. Aprobada tu propuesta».
- [x] **D4 — Snippets fuera del Website Builder**: los 10 snippets v1 NO se registran en el builder. Sólo `<t t-call="…"/>` desde home y páginas. Coherente con §10 ("todo por código, no tocar el builder"). Cualquier apertura futura a drag&drop requiere decisión explícita. **Validación**: turno del usuario (2026-04-27): «Snippets: solo includes XML, NO registrados en el builder. Coherente con CLAUDE.md §10 […]. Si en v2 se decide habilitar drag & drop en builder, se registran entonces — esa puerta requiere decisión futura explícita, no se abre por defecto».
- [x] **D5 — `/kit-consulting` ES-only**: la landing del programa Red.es queda monolingüe en castellano por naturaleza temporal y audiencia hispanohablante. **Validación**: turno del usuario (2026-04-27): «/kit-consulting en ES-only. Aprobada. Programa estatal, audiencia hispanohablante, contenido temporal».
- [x] **D6 — Convivencia temporal y switchover**: la web nueva vive en `nueva.avanzosc.es` durante desarrollo y QA, sobre el **mismo Odoo `odoo14_community`** con un `website` adicional (decisión de la propia sesión de revisión del spec — descartada la opción "Odoo separado"). Switchover al dominio principal con redirects 301 desde URLs antiguas; mapeo concreto en design spec §11. No mapeo exhaustivo de artículos de blog. **Validación**: turno del usuario (2026-04-27): «Convivencia temporal en subdominio + switchover planificado. Web nueva vive en nueva.avanzosc.es durante desarrollo y QA. Cuando esté validada, switchover al dominio principal con redirects 301 desde URLs antiguas para no perder SEO acumulado».
- [x] **Datos legales del footer (vigentes)**: confirmados en sesión 2026-04-27. CIF B20875340 · Av. Julio Urkijo 34 bajo, 20720 Azkoitia, Gipuzkoa · Tel 943 026 902 · Email comercial@avanzosc.es. (Antes en "Decisiones pendientes" — confirmados literalmente por el usuario en la sesión de revisión del spec).

#### Decisiones derivadas de la implementación de Phase 1

- [x] **D7 — Setup de menús vía `post_init_hook` Python**. El XML data declarativo NO funciona para sub-jerarquías de menú en Odoo 14 multi-website. Concretamente: `Menu.create()` en `addons/website/models/website_menu.py:80-99` aplana `parent_id` al `top_menu` de cada website cuando crea las copias per-website desde `Default Main Menu`, ignorando el `parent_id` declarado. Solo respeta el parent si es exactamente `default_menu.id` (raíz). Por tanto, los 7 records top-level con `parent_id=ref(website.main_menu)` SÍ funcionan vía XML; pero los 4 hijos del dropdown «Soluciones sectoriales» (Industrial, Distribución, Servicios, Academias) requieren creación vía `post_init_hook` con `website_id` explícito en `vals` — eso hace que `Menu.create()` tome la primera rama (`if 'website_id' in vals`) que preserva `parent_id` correctamente. Hook idempotente (búsqueda por `name + parent_id + website_id` antes de crear) — múltiples `-u` no duplican. Trade-off aceptado: rompe la promesa «sin `models/` en v1» del spec §3.2 (ahora hay un `hooks.py` ligero), pero la alternativa (XML con búsqueda dinámica del Soluciones-en-website-N) era más frágil. **Validación**: descubierto durante implementación de Task 1.1, decisión de sesión 2026-04-28: «C.1 con cleanup manual». Detalle del bug arquitectural en commit `[REVERT] task 1.1 (c08f3ba)`. Implementación en commit `[FEAT] task 1.1 (C.1)`.

- [x] **D10 — Setup de idiomas vía operación imperativa + `post_init_hook`** (no `data/website_config.xml`). Spec D1 fija ES + EU como idiomas activos. En instalaciones fresh sobre BBDD nuevas, el `post_init_setup_languages` (en `hooks.py`, parte del wrapper `_post_init_main`) se encarga imperativamente de:

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

- [x] **D9 — Estrategia i18n: ES como source en QWeb, traducciones EU vía `i18n/eu.po`, sin `.pot`**. Spec D1 fija ES + EU como idiomas activos del sitio. Implementación canónica:

  - **Source language**: castellano (`es_ES`) hardcoded en los nodos QWeb (e.g. `<h5>Soluciones</h5>`). Odoo extrae automáticamente el contenido textual de los nodos QWeb como traducible (default behavior — no hace falta atributo opt-in tipo `t-translate="on"`). Para neutralizar una string específica de la traducción, usar `t-translation="off"` en ese nodo.

  - **Translations EU**: viven en `i18n/eu.po`. El archivo lo carga Odoo automáticamente en `-i` / `-u` desde el directorio `i18n/` (no se declara en `__manifest__.py['data']`, mismo patrón que core / OCA). Cada entrada se marca con flag `#, fuzzy` y un comentario `# DRAFT - REVIEW NEEDED` por encima — Q1 cerrada exige gate de revisión lingüística por equipo Avanzosc antes de levantar el flag fuzzy.

  - **No usamos `.pot` template** en v1. La fuente canónica son los strings hardcoded en QWeb; `eu.po` se mantiene a mano. Trade-off aceptado: cuando Phase 1 cierre y la lista de strings sea estable, generar `.pot` vía `odoo-bin --i18n-export=...` y refrescar `eu.po` con `--i18n-overwrite` para alinear con la práctica OCA estándar (Phase 2 cleanup).

  - **English no entra en v1**: `en_US` no está activo en `website.language_ids` (D1). Si en algún futuro se añade, requeriría `i18n/en.po`. Sin él, usuarios `en_US` verían el source ES literal — comportamiento aceptado per spec actual.

  - **Strings que NO se traducen**: identificadores legales (CIF, dirección, razón social), URLs/slugs internos (incluso si la etiqueta visible cambia — D7-relacionado), datos numéricos. Se hardcodean idénticos en ambos idiomas.

  **Validación**: implementado en Task 1.4 (footer 4-col bilingüe). Smoke 1.4 confirma carga de `i18n/eu.po`. Verificación visual a `/eu_ES/` rendea las 15 strings traducidas. Decisión de sesión 2026-04-28 tras review de Task 1.4.

- [x] **D8 — Cleanup de menús default Odoo vía `Menu.unlink()` cascade-by-URL**. Al instalarse, los módulos `website_sale`, `website_blog` y `website_slides` siembran 4 top-level (`/shop`, `/blog`, `/slides`, `/contactus`) en cada website; queremos que SOLO sobrevivan los 7 nuestros (Inicio, Soluciones, Tienda, Formación, Conócenos, Trabaja, Contacto). El XML data NO puede borrar records ajenos (las copias per-website carecen de `xml_id` propio; solo los originales en Default Main Menu tienen los `xml_id` de core). Solución: aprovechar el comportamiento de `Menu.unlink()` en `addons/website/models/website_menu.py:105-113` — cuando se hace `unlink()` sobre un menu cuyo `parent_id == default_menu.id`, el ORM busca y unlinka también todos los `website.menu` con la misma URL y `website_id != False`. Los originales en Default Main Menu (con `website_id IS NULL`) NUNCA matchean ese filtro, por lo que se preservan junto con sus `xml_id` de core (`website.menu_contactus`, `website_sale.menu_shop`, `website_blog.menu_blog`, `website_slides.website_menu_slides`). Patrón: para cada URL a limpiar, crear un dummy bajo Default Main Menu con esa URL y unlinkarlo inmediatamente; el cascade barre todas las copias per-website. Idempotente (skip si no existe copia per-website). Implementado en `hooks.post_init_remove_odoo_defaults`, expuesto vía wrapper `_post_init_main` que también invoca `post_init_menu_hierarchy` (D7).

  **Limitación estructural**: si en el futuro se ejecuta `-u <core_module>` aislado (por ejemplo `-u website_sale` sin actualizar simultáneamente `website_avanzosc_demo`), Odoo re-aplica el data file del core que re-crea las copias per-website de `/shop` (idem para `/blog`, `/slides`, `/contactus`). El `post_init_hook` NO se vuelve a disparar (solo en `-i`), por lo que las copias re-aparecen en el navbar. Mitigación operativa: actualizar siempre `website_avanzosc_demo` junto con cualquiera de `{website, website_sale, website_blog, website_slides}`. Si la re-aparición ocurre, basta con relanzar la lógica del cleanup vía `odoo-bin shell` (la función es idempotente y segura). **Validación**: descubierto al investigar la cascade durante el revert de Task 1.1 — Home (id=5) desapareció de website 1 cuando uninstalleamos el módulo, observación que reveló el matching por URL (`/`). Decisión de sesión 2026-04-28: «D8.A.2 con plan de ejecución de los 7 pasos». Implementación en commit `[FEAT] cleanup: remove default Odoo menus from website 1 via D8 cascade pattern`.

### Decisiones pendientes

- [ ] **Decisiones diferidas a Task 3.10 hero** (snippet `s_avanzosc_hero`). Discovery hecho en sesión 2026-04-28 antes de ejecutar Phase 2; B-G se posponen hasta llegar a 3.10 con contexto acumulado de Phases 2 + 3.1-3.9. Propuestas iniciales documentadas para releer en su momento:
  - **B — Subtítulo del hero**: plan/spec no lo especifican. Propuesta: «Migración OpenUpgrade, módulos OCA y localización fiscal española. Para industria, distribución, servicios y academias.» (tono per CLAUDE.md §9.2).
  - **C — Textos + URLs de los 2 CTAs**: plan lista los 6 parámetros pero sin defaults. Propuesta: CTA1 «Ver soluciones» → `#sectores` (anchor a sección 3 home) o `/industrial`; CTA2 «Hablar con nosotros» → `/contacto`.
  - **D — Background del hero**: spec §5 dice «espacio negativo amplio» sin color. Propuesta: blanco (`--neutral-0`) con headline `--neutral-900` (máxima legibilidad; densidad reservada para timeline+contador per §9.8).
  - **E — Imagen / SVG / illustration**: spec §9.6 prohíbe stock; CLAUDE.md §9.6 prefiere fotos reales del equipo o industriales. Sin sesión fotográfica ([?] #8 spec). Propuesta: **sin imagen en v1** (solo H1 + subtítulo + 2 CTAs sobre fondo limpio); reversible al cerrar [?] #8.
  - **F — Altura del hero**: spec sin valor. Propuesta: `min-height: 600px` con padding generoso; NO 100vh (rompe scroll natural y choca con sticky header).
  - **G — Animación inicial**: plan 3.10 la lista como acceptance, pero teóricamente diferible. Propuesta: **NO diferir** — la entrada letra-por-letra es el «moment of arrival» diferenciador. Implementar completo en 3.10.

  Re-evaluar todas al iniciar 3.10 con la información acumulada de los 9 snippets previos.

- [ ] **Hex exactos del logo** — extraer de `https://avanzosc.es/web/image/website/1/logo/Avanzosc` y actualizar la tabla de 9.3.
- [ ] **SVG del logo** — vectorizar si no existe ya.
- [ ] **Portal ERP actual** — ¿el botón "Acceso clientes" apunta a `/web/login` estándar de Odoo o hay una URL custom del portal?
- [ ] **Analytics y tracking** — ¿Google Analytics 4, Plausible, Matomo? Decidir antes de ir a producción.
- [ ] **Plan de migración de contenido antiguo** — tienda y cursos del sitio actual: ¿migración de productos / cursos al nuevo, o se mantienen como están y solo se re-skinean? (La parte "dónde se despliega" quedó resuelta por D6.)

---

## 12. Convenciones de commits y scope

No-negociables operativos (complementan los técnicos de §10). Aplican a Claude principal, a cualquier subagente dispatched, y a futuros añadidos al proyecto.

1. **NO añadir trailer `Co-Authored-By:` a ningún commit.** Los commits son atribuidos al usuario que opera la herramienta. Excepción única: que el usuario lo pida explícitamente en una sesión concreta. La autorización NO se hereda entre sesiones.

2. **NO crear archivos fuera del scope literal de la tarea**, aunque «vengan bien» para tareas futuras. Si una tarea X.Y crea `foo.scss`, eso es lo único que crea, aunque el implementer prevea que `bar.scss` se necesitará en X.Z. Las dependencias se respetan en el orden del plan.

   **Aclaración**: si una tarea genera artefactos en una carpeta con `README` / index documentado (snapshots, smoke logs, etc.), **actualizar ese README es scope de la tarea, no scope creep**. Distinguir entre «no crear archivos no pedidos» (regla activa) y «mantener consistente la documentación de los archivos que sí pides» (parte del scope). Ejemplo: Task 0.2 crea 4 PNGs en `docs/superpowers/plans/snapshots/00-baseline/` → su README debe listarlas; Task 0.3 añade un PNG más a esa carpeta → su scope incluye actualizar el README con la nueva entrada.

3. **Verificar antes de crear**: si la tarea crea archivos en una carpeta, primero `ls` (o equivalente) para ver si ya existen. Si existen, **leer y extender**, no sobrescribir.

4. **Cada tarea tiene smoke test obligatorio post-implementación**: el módulo debe recargar sin errores ni warnings nuevos (comando en §7). Sin smoke test verde, la tarea no se cierra.

5. **El smoke test se ejecuta y se guarda en `docs/smoke-tests/<task-id>.log`** (ej: `docs/smoke-tests/0.1.log`). El log captura las **últimas 20 líneas del output** de Odoo tras `-u <module> --stop-after-init`. El commit que cierra la tarea incluye este archivo. Sin log, tarea no cierra.

   **Política de warnings toleradas en smoke logs**: el log se guarda íntegro. Cualquier `WARNING` que aparezca debe revisarse, EXCEPTO las siguientes (ruido conocido del core de Odoo 14, fuera de nuestro control):
   - `DeprecationWarning: nodes.Node.traverse() is obsoleted by Node.findall()` desde `/opt/odoo/v14/base/odoo/addons/base/models/ir_module.py:128`. Justificación: stdlib `docutils` deprecó `Node.traverse()` y el core de Odoo 14 no se ha actualizado; aparece exactamente 1 vez por instalación, no afecta funcionalidad.

   Cualquier warning **no listado arriba** debe investigarse antes de cerrar la tarea (probablemente sí es del módulo o de una dependencia que toca el módulo). La lista vive aquí, no en cada log; si una nueva warning recurrente del core aparece, se añade a esta lista en un commit `[DOC]` aparte y queda tolerada para futuras tareas.

6. **El smoke test se ejecuta SIEMPRE vía `./scripts/run-smoke.sh <task-id>`**, nunca invocando `odoo-bin` directamente. El script gestiona el ciclo «parar dev server → smoke → restart dev server con los mismos args», escribe `docs/smoke-tests/<task-id>.log` (regla #5) y devuelve exit code 1 si el output contiene `Traceback` o `ERROR`. Esta regla aplica a Claude principal y a cualquier subagente. El comando subyacente que ejecuta el script está documentado en §7 y solo es referencia interna; en flujo real se invoca por el script. **Garantía del script**: `exit 0` implica que el dev server responde HTTP 200/303 en `localhost:14070` tras el restart, no solo que el proceso esté vivo. Tres modos de fallo del restart se detectan con diagnóstico distinguido en stderr: «died immediately after restart», «died before listening on :14070», «alive but not listening on :14070».

7. **Reglas STOP de seguridad**: cuando una regla de las anteriores (o cualquier rule explícita en este documento) se dispara como «STOP», parar inmediatamente. Pero **la regla cubre un riesgo, no una condición sintáctica**. Si la investigación honesta demuestra que el riesgo NO aplica al caso concreto (p. ej., un xml_id en módulo distinto de `__export__/base` pero con `noupdate=true` que neutraliza la recreación tras delete), presentar la evidencia al usuario y pedir decisión humana — **no proceder en silencio ni saltarse la regla por interpretación propia**. La separación entre «condición que dispara el STOP» y «riesgo que la regla cubre» es responsabilidad del agente surfacearla; la decisión de continuar o respetar el STOP estricto es del usuario.

**Política de añadidos a este documento**: cualquier sección nueva (§13, §14, …) va al final, NUNCA insertada en medio. Numeración estable = referencias estables.
