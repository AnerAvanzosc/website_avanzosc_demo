ES IMPORTANTE QUE NUNCA HAGAS NADA EN GITHUB (DIGO PUSH COMMIT NI NADA)
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

1. **Inicio**
2. **Soluciones sectoriales** (dropdown):
   - Industrial (fabricación, química, alimentaria, mecanizado, textil)
   - Distribución (retail, ecommerce, mayoristas)
   - Servicios (IT, SAT, despachos)
   - Academias y centros educativos
3. **Tienda**
4. **Formación** (renombrado de "Cursos")
5. **Conócenos**
6. **Trabaja con nosotros**
7. **Contacto**

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
- Módulo versionado en Git, ruta completa: `/opt/odoo/v14/github/avanzosc/odoo-addons/website_avanzosc_demo`.
- El `addons_path` ya incluye `/opt/odoo/v14/github/avanzosc/odoo-addons` — confirmado. Odoo verá el módulo en cuanto tenga `__manifest__.py`.
- Arrancar SIEMPRE con `--dev=all`:
  ```bash
  ./odoo-bin -c /etc/odoo/odoo14_community.conf --dev=all -d odoo14_community
  ```
- Tras añadir archivos nuevos o cambiar `__manifest__.py`:
  ```bash
  ./odoo-bin -c /etc/odoo/odoo14_community.conf -u website_avanzosc_demo -d odoo14_community --stop-after-init
  ```

### Git
- Repo: `github.com/avanzosc/odoo-addons`.
- Commits pequeños, mensajes en inglés (convención OCA): `[ADD] website_avanzosc_demo: snippet hero with GSAP entrance animation`.
- Prefijos habituales en Odoo/OCA: `[ADD]`, `[FIX]`, `[IMP]` (improve), `[REF]` (refactor), `[REM]` (remove), `[MIG]` (migration).
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
│       ├── contador_modulos.xml
│       ├── timeline_trayectoria.xml
│       ├── sectores_grid.xml
│       ├── equipo.xml
│       ├── caso_exito.xml
│       └── cta_kit_consulting.xml
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
- [x] **Repo y ruta**: `github.com/avanzosc/odoo-addons`, en `/opt/odoo/v14/github/avanzosc/odoo-addons/website_avanzosc_demo`.
- [ ] **Idiomas**: propuesta C — ES + EU + EN desde el inicio. Afectaría a `res.lang`, `website.language_ids` y estructura de URLs (`/es/`, `/eu/`, `/en/`). Cada página corporativa fija (home, sectoriales, conócenos, contacto, trabaja con nosotros, kit-consulting) se publicaría en los 3 idiomas. Casos de éxito y otros contenidos largos podrían arrancar ES-only con traducción progresiva. **Sin validación explícita del usuario — pendiente de confirmar.**
- [ ] **Claim definitivo de la home**: candidatos en §9.1 (A: "17 años…", B: "Odoo industrial de verdad, desde 2008.", C: "Los veteranos de Odoo en España."). **Sin validación explícita del usuario — pendiente de elegir.**
- [ ] **Estructura de secciones de la home** — propuesta de 9 bloques (excluyendo blog):
  1. Hero con claim + CTAs.
  2. Tres pilares (Desde 2008 / 600+ módulos OCA / Equipo STEM).
  3. Contador animado "600+ módulos".
  4. Grid de sectores (Industrial · Distribución · Servicios · Academias).
  5. Timeline trayectoria (hitos 2008→hoy de §9.1).
  6. Equipo (fotos reales + titulación + especialidad).
  7. Caso de éxito destacado.
  8. CTA Kit Consulting.
  9. CTA contacto final (teléfono + email + botón).

  **Sin validación explícita del usuario — pendiente de confirmar bloques y orden.**

- [ ] **Blog**: propuesta de dejarlo fuera del sitio completo (ni menú principal ni home), por falta de capacidad editorial sostenida. Implicaría: `website_blog` NO en `depends`; ocultar cualquier `website.menu` de blog del módulo base; sin plan editorial. **Sin validación explícita del usuario — pendiente de confirmar.**

### Decisiones pendientes

- [ ] **Casos de éxito destacados** — de los 600+ módulos, qué 6-8 proyectos son los "killer" para mostrar (grupo de 7 colegios, industrial con exportación internacional, configurador de producto V8→V12, etc.). Necesitamos nombres de cliente (con permiso) o descripciones anonimizadas.
- [ ] **Hex exactos del logo** — extraer de `https://avanzosc.es/web/image/website/1/logo/Avanzosc` y actualizar la tabla de 9.3.
- [ ] **SVG del logo** — vectorizar si no existe ya.
- [ ] **Datos legales del footer** — confirmar que siguen vigentes:
  - CIF: B20875340
  - Av. Julio Urkijo 34 bajo, 20720 Azkoitia, Gipuzkoa
  - Tel: 943 026 902
  - Email: comercial@avanzosc.es
- [ ] **Portal ERP actual** — ¿el botón "Acceso clientes" apunta a `/web/login` estándar de Odoo o hay una URL custom del portal?
- [ ] **Analytics y tracking** — ¿Google Analytics 4, Plausible, Matomo? Decidir antes de ir a producción.
- [ ] **Dominio y despliegue** — ¿la web nueva se desarrolla en un Odoo aparte o sobre el mismo donde está la web actual? ¿Plan de migración de contenido antiguo (tienda, cursos)?
