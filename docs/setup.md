# Setup operacional — `website_avanzosc_demo`

Documento extendido del entorno de desarrollo. Complementa `CLAUDE.md` §7 (paths críticos + comandos esenciales). Aquí van: MCPs, variables de entorno y formas de configurarlas, y el flujo de trabajo con Claude Code.

---

## 1. MCPs declarados

El `.mcp.json` del módulo declara 4 MCPs: `playwright`, `context7`, `fs-addons`, `odoo`.

| MCP | Para qué |
|---|---|
| `context7` | Docs actualizadas. Antes de usar GSAP, Lenis, Bootstrap 5, Odoo 14 API, etc., invocar con "use context7". |
| `playwright` | Verificación visual. URL local: `http://localhost:14070`. |
| `fs-addons` | Acceso al directorio de addons configurado en `ODOO_ADDONS_PATH`. |
| `odoo` | Consultas a la instancia `odoo14_community` (solo lectura). |

---

## 2. Variables de entorno requeridas

El `.mcp.json` no lleva credenciales ni rutas absolutas hardcodeadas; todo se resuelve por **variables de entorno** que cada dev configura en su máquina. Hay un `.env.example` en la raíz con la lista completa y valores de muestra.

| Variable | Para qué | Ejemplo |
|---|---|---|
| `ODOO_URL` | URL de la instancia Odoo local | `http://localhost:14070` |
| `ODOO_DB` | Nombre de la base de datos | `odoo14_community` |
| `ODOO_USER` | Usuario Odoo (lectura para el MCP) | `admin` |
| `ODOO_PASSWORD` | Password de ese usuario | *(la tuya, NO commitear)* |
| `ODOO_ADDONS_PATH` | Ruta absoluta al directorio de addons que el MCP `fs-addons` puede leer | `/opt/odoo/v14/github/avanzosc/odoo-addons` |

### Dos formas válidas de configurarlas

**Opción 1 — `.bashrc` / `.zshrc` (export persistente):**

```bash
export ODOO_URL=http://localhost:14070
export ODOO_DB=odoo14_community
export ODOO_USER=admin
export ODOO_PASSWORD=tu-password-real
export ODOO_ADDONS_PATH=/opt/odoo/v14/github/avanzosc/odoo-addons
```

**Opción 2 — Fichero `.env` local en la raíz del módulo** (cargado manualmente al lanzar Claude Code, p.ej. `set -a && source .env && set +a && claude`). El `.gitignore` ya bloquea `.env` y `.env.*`, así que no hay riesgo de commitear credenciales.

Si falta `ODOO_PASSWORD` o `ODOO_ADDONS_PATH`, los MCPs `odoo` y `fs-addons` arrancan rotos. El `.env.example` es el contrato — actualízalo cuando añadas variables nuevas.

---

## 3. Flujo de trabajo con Claude Code

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

## 4. Comandos completos del servidor

> Los paths críticos y los 2 comandos esenciales (arranque dev + update tras cambios) viven en `CLAUDE.md` §7. Esta sección los reproduce con contexto extra.

### Arrancar servidor en modo dev

Arrancar SIEMPRE con `--dev=all`:

```bash
/opt/odoo/v14/venv/bin/python /opt/odoo/v14/base/odoo-bin -c /etc/odoo/odoo14_community.conf --dev=all -d odoo14_community
```

### Actualizar el módulo tras cambios

Tras añadir archivos nuevos o cambiar `__manifest__.py`:

```bash
/opt/odoo/v14/venv/bin/python /opt/odoo/v14/base/odoo-bin -c /etc/odoo/odoo14_community.conf -u website_avanzosc_demo -d odoo14_community --stop-after-init
```

### Smoke test (regla operativa)

Por convención del proyecto (CLAUDE.md §12 #6), el smoke se ejecuta SIEMPRE vía `./scripts/run-smoke.sh <task-id>`, no invocando `odoo-bin` directamente. El script gestiona el ciclo «parar dev server → smoke → restart», escribe `docs/smoke-tests/<task-id>.log` y devuelve exit code 1 si el output contiene `Traceback` o `ERROR`.

### Addons path

Para que Odoo cargue el módulo desde el working dir, el `addons_path` debe incluir esa ruta o existir un symlink desde un directorio ya presente en `addons_path`. Verificar en cada install/update.
