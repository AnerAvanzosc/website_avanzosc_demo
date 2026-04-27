# Session handover — `website_avanzosc_demo`

Documento de continuidad para la siguiente sesión. Lee esto antes de tocar nada.

---

## 1. Estado del repo

- **Working dir local**: `/opt/odoo/v14/workspace/website_avanzosc_demo`
- **Remoto**: `https://github.com/AnerAvanzosc/website_avanzosc_demo` (público, fork experimental personal del desarrollador)
- **Rama**: `main` (única)
- **Working tree**: limpio
- **Último commit**: `c9de31e` — `[DOC] §11: close brainstorm decisions`
- **Commits locales sin pushear** (de más antiguo a más reciente):
  - `2e6b7be` `[DOC] CLAUDE.md: clarify repo location, GitHub policy and §11 structure`
  - `c9de31e` `[DOC] §11: close brainstorm decisions`
- **Push pendiente de autorización explícita en sesión futura. Las autorizaciones no se heredan.**

Variables de entorno requeridas para los MCPs (ver `.env.example` y `CLAUDE.md` §7): `ODOO_URL`, `ODOO_DB`, `ODOO_USER`, `ODOO_PASSWORD`, `ODOO_ADDONS_PATH`.

---

## 2. Qué se hizo en esta sesión (2026-04-27)

### 2.1 Limpieza de coherencia en CLAUDE.md (commit `2e6b7be`)

El handover anterior había detectado 3 ambigüedades. Resueltas en este commit:

- **Línea 1 (política GitHub)**: reformulada de "NUNCA HAGAS NADA EN GITHUB" a "Nunca operar sobre GitHub (push, branches, PRs, settings, releases) sin autorización explícita en la sesión actual. Las autorizaciones son puntuales y NO se heredan entre sesiones."
- **§7 (Servidor Odoo local)**: actualizada la ubicación real del repo (`AnerAvanzosc/website_avanzosc_demo` con working dir `/opt/odoo/v14/workspace/...`); nota corta de que el repo oficial `avanzosc/odoo-addons` no se toca durante la fase experimental.
- **§11 estructura**: las 4 decisiones estratégicas que vivían como `[ ]` bajo el subapartado "Decisiones ya tomadas ✓" se movieron a "Decisiones pendientes". El subapartado "ya tomadas" quedó solo con `[x]` reales.

### 2.2 Brainstorm cerrado de las 5 decisiones estratégicas (commit `c9de31e`)

Ejecutado vía `superpowers:brainstorming`, **una decisión a la vez**, con 3-5 líneas de implicaciones técnicas por cada opción antes de cada pregunta. Cada decisión cerrada con **cita literal** de la respuesta del usuario en CLAUDE.md §11.

| # | Decisión | Resultado | Cita literal del usuario |
|---|---|---|---|
| 1 | Idiomas | **ES + EU** (URL raíz ES sin prefijo + `/eu/`). `website.language_ids = [es_ES, eu_ES]`. Páginas corporativas fijas en los 2 idiomas; casos de éxito y contenidos largos arrancan ES-only con traducción progresiva. | «hagamos el B» |
| 2 | Claim de la home | **«Odoo industrial de verdad, desde 2008.»** (opción B de §9.1). EU: «Benetako Odoo industriala, 2008tik.». El activo "17 años" se traslada al contador animado y/o timeline en lugar del H1. | «b» |
| 3 | Estructura de la home | **8 secciones, funnel B2B reordenado** (Approach B), 9 snippets QWeb. Bloque 4 combina `s_avanzosc_contador` + `s_avanzosc_timeline` en una sola sección visual. **Snippets NUEVOS a crear** (no listados en §8): `s_avanzosc_pilares`, `s_avanzosc_cta_contacto`. | «b» |
| 4 | Casos de éxito | **8 archetypes anónimos** (sin nombres, sin fotos, sin métricas reales). 4 industrial (metalúrgico, química, alimentaria, textil) + 2 distribución (retail multitienda, mayorista) + 1 servicios (IT/SAT) + 1 academias (grupo educativo multicentro). Snippet `s_avanzosc_caso_exito` se diseñará anonymous-first. | «lo que recomiendes, pero por ahora que sea generico en cuanto a nombres fotos y datos, ya que no tengo ni yo los datos» |
| 5 | Blog | **Fuera del sitio**. `website_blog` NO en `depends`, ni menú, ni link, ni snippet en home. Módulo residual en BD pero invisible. Reversible si en el futuro hay recursos editoriales sostenidos. | «no quiero blogs, fuera fuear» |

Detalle completo de cada decisión en CLAUDE.md §11 → "Decisiones ya tomadas ✓".

---

## 3. Decisiones operativas pendientes en §11

**No bloquean empezar el spec ni la implementación inicial.** Son tareas a cerrar antes de producción, no antes de picar código.

1. **Hex exactos del logo** — extraer del PNG actual y actualizar la tabla §9.3.
2. **SVG vectorial del logo** — vectorizar si no existe ya.
3. **Datos legales del footer** — confirmar vigencia de CIF B20875340, Av. Julio Urkijo 34 bajo (20720 Azkoitia), Tel 943 026 902, comercial@avanzosc.es.
4. **Portal ERP** — ¿botón "Acceso clientes" apunta a `/web/login` estándar o a URL custom?
5. **Analytics y tracking** — ¿GA4, Plausible, Matomo, ninguno?
6. **Dominio y despliegue** — ¿Odoo aparte o sobre el de producción? Plan de migración de tienda y cursos antiguos.

---

## 4. Siguiente paso planificado

**Redactar el design doc consolidado del módulo en sesión nueva**, en:
`docs/superpowers/specs/2026-04-27-website-avanzosc-demo-design.md`

Debe cubrir:
- Arquitectura del módulo `website_avanzosc_demo` (estructura de carpetas, `__manifest__`, hooks de assets v14 vía herencia XML de `web.assets_frontend`).
- Modelo i18n ES + EU (`website.language_ids`, estructura de URLs, alcance de traducción por página).
- Estructura de la home (las 8 secciones validadas, con QWeb por sección).
- Inventario completo de snippets: los 7 listados en §8 + los 2 nuevos `s_avanzosc_pilares` y `s_avanzosc_cta_contacto`.
- Sistema de animaciones/UX (GSAP 3 + ScrollTrigger + SplitText, Lenis, IntersectionObserver; reglas §5: solo `transform`/`opacity`, `prefers-reduced-motion`, sin scrolljacking).
- Catálogo de casos: los 8 archetypes anónimos, con esquema del snippet `s_avanzosc_caso_exito` anonymous-first y plan de "promoción" a nombrado cuando se consigan permisos.
- Páginas sectoriales (industrial / distribución / servicios / academias) y secundarias (conócenos, trabaja con nosotros, contacto, kit-consulting landing).
- Header (Acceso clientes destacado) y footer.

Tras escribir el spec → revisión por el usuario → transición a `superpowers:writing-plans` para el plan de implementación por fases. **No invocar otros skills de implementación entre medias.**

---

## 5. Errores y cosas a vigilar (acumulado entre sesiones)

### 5.1 Heredado de la sesión anterior
- **`.claude/settings.local.json` es local-only** (gitignored, `.gitignore:28`). Contiene allowlist de Bash con paths absolutos de `/opt/odoo/v14`, `/etc/odoo`, `/home/avanzosc` y PIDs. Nunca commitear. Si aparece en `git status` como tracked, algo se ha roto.
- **`.env.example` está exceptuado del `.env.*` ignore** (`!.env.example`). El `.env` real (con credenciales) sigue ignorado.
- **Repo independiente, no subcarpeta del oficial**: el módulo vive en `github.com/AnerAvanzosc/website_avanzosc_demo` (fork personal), no en `github.com/avanzosc/odoo-addons`. Si más adelante se decide integrarlo en el oficial, requerirá `git subtree` o copia + PR.
- **Memoria persistente vacía**: el directorio `~/.claude/projects/-opt-odoo-v14-workspace-website-avanzosc-demo/memory/` sigue sin usarse.

### 5.2 De esta sesión
- **No añadir `Co-Authored-By` a commits sin que el usuario lo pida.** Error señalado en el handover anterior; se mantuvo en esta sesión — ningún commit nuevo lo lleva.
- **CLAUDE.md línea 1 ya está reformulada**: nunca operar sobre GitHub sin autorización explícita en la sesión actual. Las autorizaciones son puntuales y NO se heredan entre sesiones.
- **2 commits locales sin pushear al cierre**: `2e6b7be` y `c9de31e`. Si en sesión futura el usuario autoriza el push, son los pendientes.
- **Forma del brainstorm que funcionó**: una decisión a la vez, 3-5 líneas de implicaciones por opción, multiple choice cuando aplica, recomendación explícita del asistente, cita literal de la respuesta del usuario al cerrar en §11. El usuario priorizó respuestas cortas («b», «hagamos el B»). Repetir este estilo en futuros brainstorms del mismo proyecto.
- **Anonimato total en casos**: los 8 archetypes no tienen nombres, fotos ni datos reales. Cuando se consigan permisos de un cliente, ese caso se promociona de anónimo a nombrado sin tocar la estructura del snippet.

---
