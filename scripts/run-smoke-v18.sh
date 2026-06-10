#!/usr/bin/env bash
# scripts/run-smoke-v18.sh — smoke install/update against Odoo v18.
#
# Usage:
#   ./scripts/run-smoke-v18.sh <install|update> [task-id]
# Examples:
#   ./scripts/run-smoke-v18.sh install
#   ./scripts/run-smoke-v18.sh update v18-fase1-install-attempt
#   DEBUG=1 ./scripts/run-smoke-v18.sh install
#
# Behaviour:
#   - install mode: -i website_avanzosc_demo --stop-after-init
#   - update mode:  -u website_avanzosc_demo --stop-after-init
#   - Default log level: info. DEBUG=1 → debug.
#   - Pre-check XML 1.0 comments (shared with v14 smoke).
#   - Exit 1 if output contains Traceback or 'ERROR ' lines, or odoo-bin exits non-zero.
#   - If task-id is provided, last 20 lines saved to docs/smoke-tests/<task-id>.log.
#
# Does NOT manage a v18 dev server lifecycle (no v18 dev server is running
# in this workspace; the equivalent v14 script handles that for v14).

set -euo pipefail

MODE="${1:-}"
TASK_ID="${2:-}"

if [[ "$MODE" != "install" && "$MODE" != "update" ]]; then
    echo "ERROR: mode required (install|update). Usage: $0 <install|update> [task-id]" >&2
    exit 2
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

# Shared XML 1.0 pre-check (same script as v14 smoke).
"$SCRIPT_DIR/check-xml-comments.sh" || {
    echo "[run-smoke-v18] Pre-check failed; aborting smoke." >&2
    exit 1
}

ODOO_PYTHON="/opt/odoo/v18/venv/bin/python"
ODOO_BIN="/opt/odoo/v18/base/odoo-bin"
ODOO_CONF="/etc/odoo/odoo18.conf"
ODOO_DB="odoo18_avanzosc_web"
MODULE="website_avanzosc_demo"

LOG_LEVEL="info"
if [[ "${DEBUG:-0}" == "1" ]]; then
    LOG_LEVEL="debug"
fi

case "$MODE" in
    install) OP_FLAG="-i" ;;
    update)  OP_FLAG="-u" ;;
esac

echo "[run-smoke-v18] mode=$MODE log-level=$LOG_LEVEL db=$ODOO_DB module=$MODULE"

TMP_FULL="$(mktemp)"
trap 'rm -f "$TMP_FULL"' EXIT INT TERM

SMOKE_RC=0
"$ODOO_PYTHON" "$ODOO_BIN" \
    -c "$ODOO_CONF" \
    -d "$ODOO_DB" \
    "$OP_FLAG" "$MODULE" \
    --stop-after-init \
    --log-level="$LOG_LEVEL" \
    > >(tee "$TMP_FULL") 2>&1 || SMOKE_RC=$?

# Save tail-20 to docs/smoke-tests if task-id was provided.
if [[ -n "$TASK_ID" ]]; then
    LOG_DIR="docs/smoke-tests"
    mkdir -p "$LOG_DIR"
    LOG_FILE="$LOG_DIR/${TASK_ID}.log"
    tail -20 "$TMP_FULL" > "$LOG_FILE"
    echo "[run-smoke-v18] tail-20 saved to $LOG_FILE"
fi

# Failure detection (same heuristics as v14 smoke).
SMOKE_FAIL=0
if grep -qE 'Traceback' "$TMP_FULL"; then
    echo "[run-smoke-v18] SMOKE FAILED: Traceback detected" >&2
    SMOKE_FAIL=1
elif grep -qE '^[^[:space:]]+ ERROR ' "$TMP_FULL"; then
    echo "[run-smoke-v18] SMOKE FAILED: ERROR line detected" >&2
    SMOKE_FAIL=1
elif [[ $SMOKE_RC -ne 0 ]]; then
    echo "[run-smoke-v18] SMOKE FAILED: odoo-bin exit $SMOKE_RC" >&2
    SMOKE_FAIL=1
fi

if [[ $SMOKE_FAIL -eq 1 ]]; then
    exit 1
fi

# GATE A — Negative proof: módulo declarado pero no encontrado / no installable.
# Caso real: el symlink en addons_path desapareció y Odoo skippea el módulo
# emitiendo sólo un WARNING (no ERROR), exit 0 limpio. Las 3 heurísticas
# anteriores no lo detectan. Síntoma: 'not installable, skipped' o
# 'no manifest file found'.
if grep -qE "${MODULE}: not installable|module ${MODULE}: no manifest file found" "$TMP_FULL"; then
    echo "[run-smoke-v18] FAIL: ${MODULE} no encontrado o no instalable en addons_path." >&2
    echo "[run-smoke-v18]       Verifica el symlink en /opt/odoo/v18/github/avanzosc/odoo-addons/${MODULE}." >&2
    exit 2
fi

# GATE B — Positive proof: el módulo realmente se cargó.
# Caso: el módulo está en addons_path pero por alguna razón nunca entra al
# grafo de instalación (filtro --modules, install_module mal seteado, etc.).
# Buscamos al menos uno de los marcadores INFO que Odoo emite al tocar el
# módulo: 'loading <module>/...' (cualquier archivo) o el resumen final.
if ! grep -qE "loading ${MODULE}/|Module ${MODULE} loaded" "$TMP_FULL"; then
    echo "[run-smoke-v18] FAIL: ${MODULE} nunca se intentó cargar." >&2
    echo "[run-smoke-v18]       Causas posibles: addons_path no incluye el módulo, manifest no parseable," >&2
    echo "[run-smoke-v18]       o el módulo ya estaba instalado y -i no lo re-ejercitó." >&2
    exit 3
fi

echo "[run-smoke-v18] SMOKE OK"
exit 0
