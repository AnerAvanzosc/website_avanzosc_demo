# Session handover — `website_avanzosc_demo`

Documento de continuidad para la siguiente sesión. Lee esto antes de tocar nada.

---

## 1. Estado del repo

- **Working dir local**: `/opt/odoo/v14/workspace/website_avanzosc_demo`
- **Remoto**: `https://github.com/AnerAvanzosc/website_avanzosc_demo` (público)
- **Rama**: `main` (única, default en GitHub)
- **Working tree**: limpio
- **Último commit**: `bb5bb13` — `[FIX] security: externalize credentials and paths before public push`
- **Historial completo (2 commits)**:
  - `309fc2f` `[ADD] website_avanzosc_demo: initial scaffold — experimental workspace`
  - `bb5bb13` `[FIX] security: externalize credentials and paths before public push`

Variables de entorno requeridas para que arranquen los MCPs (ver `.env.example` y `CLAUDE.md` §7):
`ODOO_URL`, `ODOO_DB`, `ODOO_USER`, `ODOO_PASSWORD`, `ODOO_ADDONS_PATH`.

---

## 2. Decisiones realmente validadas por el usuario en esta sesión

Citas literales del turno donde el usuario aprobó cada cosa.

### 2.1 Operativa Git
- **Crear repo Git en el workspace** — turno: `cd /opt/odoo/v14/workspace/website_avanzosc_demo / git init / git add . / git commit -m "Initial scaffold — experimental phase"`. Comandos exactos del usuario.
- **Opción A para `.gitignore` mínimo** (incluir `__pycache__`, `*.pyc`, `.vscode`, `.idea`, etc.) — turno del usuario: `a`.
- **Reorganización a 2 commits con Opción A** (aplastar audit dentro del initial, security fix como segundo commit) — turno del usuario: `Opción A confirmada. Tira.`
- **Push autorizado al repo público** — turnos: `hazlo` + `https://github.com/aneravanzosc/website_avanzosc_demo este es link en donde quiero subir el proyecto`.
- **Renombrar `master` → `main` y borrar `master` remoto** — turno: `Renombra la rama default de master a main. Local: git branch -M main...`
- **Cambiar default branch via API + delete `master` remoto** — turno: `si` (en respuesta a oferta explícita de hacerlo por API).

### 2.2 Contenido del proyecto
- **Quitar tlf móvil 688 663 234 de CLAUDE.md §11** — instrucción explícita en el plan de cierre de auditoría.
- **Externalizar `ODOO_ADDONS_PATH` a env var en `.mcp.json`** — instrucción explícita.
- **Crear `.env.example` con la plantilla de variables** — instrucción explícita con valores listados.
- **Documentar variables de entorno en CLAUDE.md §7** — instrucción explícita.
- **Archivar plan i18n en `docs/superpowers/plans/archived/`** — instrucción explícita en la auditoría de asunciones.
- **Revertir 4 `[x]` a `[ ]` en CLAUDE.md §11** (idiomas, claim, 9 bloques, blog) — instrucción explícita.

### 2.3 Mensajes de commit
Los 3 mensajes que están (o estuvieron) en historial los proporcionó el usuario verbatim. **Ningún commit lleva `Co-Authored-By` salvo el initial original (que ya no existe en historia, fue reescrito en Opción A).**

---

## 3. Decisiones explícitamente NO tomadas

Reabiertas en CLAUDE.md §11 tras la auditoría de asunciones. **No asumas que ninguna está cerrada.** Pregunta antes de actuar sobre ellas.

### 3.1 Estratégicas (reabiertas porque las había tratado como cerradas sin validación)
- **Idiomas del sitio**: ES-only / ES+EN / ES+EU+EN. Implica `res.lang`, `website.language_ids`, estructura de URLs, alcance de traducción por página.
- **Claim definitivo de la home**: candidatos A/B/C en CLAUDE.md §9.1.
- **Estructura de bloques de la home**: propuesta de 9 bloques pendiente de validar (orden y contenido).
- **Blog**: ¿dentro o fuera del sitio? Con o sin plan editorial.

### 3.2 Pendientes desde el origen
- **Casos de éxito destacados** (6-8 proyectos, con permiso de cliente o anonimizados).
- **Hex exactos del logo** (extraer del PNG actual).
- **SVG vectorial del logo**.
- **Datos legales del footer** (confirmar vigencia de CIF, dirección, tlf fijo, email comercial).
- **Portal ERP**: ¿`/web/login` estándar o URL custom?
- **Analytics**: GA4 / Plausible / Matomo / nada.
- **Dominio y plan de despliegue**: ¿Odoo aparte o sobre el de producción? Migración de tienda y cursos antiguos.

---

## 4. Errores conocidos y cosas a vigilar

### 4.1 Errores que cometí en esta sesión
- **Asumí decisiones de CLAUDE.md §11 como cerradas** sin evidencia conversacional de validación. El usuario me hizo auditar, lo reconocí, y revertimos los 4 `[x]` a `[ ]`. Aprendizaje: los `[x]` en docs no son evidencia de validación si no hay turno del usuario respaldándolo.
- **Añadí `Co-Authored-By` al primer commit** (`Initial scaffold — experimental phase`) sin que el usuario lo pidiera. Ese commit ya no está en historia (sustituido en Opción A). El usuario me lo señaló como asunción.
- **Reporté incorrectamente que `.claude/settings.local.json` estaba en el commit inicial.** Verificación posterior con `git cat-file -p` mostró que **nunca estuvo tracked**. El harness de Claude Code crea/modifica `.claude/` después del primer scan de git, y como nunca entró al índice, no estaba en historia. Por suerte el plan de Opción A funcionó igual.
- **Asumí que el usuario había cambiado el default branch en GitHub** cuando dijo `estoy en main ya`. La API decía lo contrario (`master` seguía siendo default). Hubo que cambiarlo por API. Aprendizaje: verificar con `gh repo view --json defaultBranchRef` antes de intentar borrar la rama antigua.

### 4.2 Cosas a vigilar en sesiones futuras
- **`.claude/settings.local.json` es local-only** (gitignored en `.gitignore:28`). Contiene allowlist de Bash con paths absolutos de `/opt/odoo/v14`, `/etc/odoo`, `/home/avanzosc` y PIDs concretos. **Nunca commitear.** Si en algún momento aparece en `git status` como tracked, algo se ha roto.
- **`.env.example` está exceptuado del `.env.*` ignore** (`!.env.example` en `.gitignore`). El `.env` real (con credenciales) sigue ignorado.
- **CLAUDE.md línea 1**: `ES IMPORTANTE QUE NUNCA HAGAS NADA EN GITHUB (DIGO PUSH COMMIT NI NADA)`. En esta sesión el usuario sobreescribió esta restricción con autorizaciones explícitas (`hazlo` + URL). En sesiones futuras, **volver a pedir autorización explícita** antes de cualquier commit/push — no asumir que el override de esta sesión persiste.
- **El módulo está versionado como repo independiente** en `github.com/AnerAvanzosc/website_avanzosc_demo`, no como subcarpeta de `github.com/avanzosc/odoo-addons` (que es como CLAUDE.md §7 lo describe en "Git"). Es un fork experimental personal del usuario. Si en algún momento se decide integrarlo en el repo grande de avanzosc, requerirá `git subtree` o copia + PR.
- **Memoria persistente vacía**: el directorio `~/.claude/projects/-opt-odoo-v14-workspace-website-avanzosc-demo/memory/` no existe todavía. No hay memorias guardadas.

---

## 5. Próximo paso planificado

**Brainstorm formal de las decisiones del §11 en orden**, siguiendo el flujo `superpowers:brainstorming`. Orden propuesto (ataca primero las que bloquean al resto):

1. **Idiomas del sitio** — bloquea estructura de URLs, alcance de traducción, modelo `res.lang`.
2. **Claim de la home** — bloquea hero, copy, traducciones.
3. **Estructura de bloques de la home** — bloquea snippets a desarrollar.
4. **Blog dentro/fuera** — afecta a `depends`, menú, plan editorial.
5. **Casos de éxito** — bloquea snippet "caso de éxito".
6. **Logo (hex + SVG)** — bloquea paleta SCSS y header.
7. **Datos legales footer** — confirmar y cerrar.
8. **Portal ERP** — decidir destino del botón "Acceso clientes".
9. **Analytics** — decidir antes de producción.
10. **Dominio y despliegue** — decidir antes de meterse a fondo.

**No empezar a picar páginas/snippets hasta tener al menos 1-4 decididas**, porque condicionan toda la arquitectura QWeb del módulo.
