#!/usr/bin/env bash
# scripts/run-smoke.sh — automated dev → smoke → restart-dev cycle.
#
# Usage:
#   ./scripts/run-smoke.sh <task-id>
# Example:
#   ./scripts/run-smoke.sh 0.3
#
# Behaviour:
#   1. Detects running Odoo dev server matching odoo-bin --dev=all -d odoo14_community.
#   2. Captures its full command line so we can restart it identically.
#   3. SIGTERM the dev (wait up to 10s, SIGKILL fallback). Skip if no dev was running.
#   4. Runs smoke: -u website_avanzosc_demo --stop-after-init.
#   5. Saves last 20 lines to docs/smoke-tests/<task-id>.log.
#   6. Fails (exit 1) if full smoke output contains ERROR or Traceback.
#   7. On success, restarts the dev server with the captured args (nohup, background).
#   8. Records new PID at /tmp/odoo-dev.pid.
#
# Idempotent: running twice in a row is safe.
# Required by CLAUDE.md §12 rule #6.

set -u

TASK_ID="${1:-}"
if [[ -z "$TASK_ID" ]]; then
    echo "ERROR: task-id required. Usage: $0 <task-id>" >&2
    exit 2
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

LOG_DIR="docs/smoke-tests"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/${TASK_ID}.log"
PID_FILE="/tmp/odoo-dev.pid"

ODOO_PYTHON="/opt/odoo/v14/venv/bin/python"
ODOO_BIN="/opt/odoo/v14/base/odoo-bin"
ODOO_CONF="/etc/odoo/odoo14_community.conf"
ODOO_DB="odoo14_community"
MODULE="website_avanzosc_demo"
DEV_LOG="/tmp/odoo-dev.log"

# 1-2. Detect running dev server and capture exact args.
DEV_PID="$(pgrep -f "${ODOO_BIN}.*--dev=all.*-d ${ODOO_DB}" | head -n 1)"
DEV_ARGS=""
if [[ -n "$DEV_PID" ]]; then
    DEV_ARGS="$(ps -p "$DEV_PID" -o args= 2>/dev/null)"
    echo "[run-smoke] Found running dev server: PID=$DEV_PID"
    echo "[run-smoke]   args: $DEV_ARGS"

    # 3. SIGTERM, wait, SIGKILL fallback.
    echo "[run-smoke] Stopping dev server (SIGTERM)..."
    kill -TERM "$DEV_PID" 2>/dev/null || true
    for i in $(seq 1 10); do
        if ! kill -0 "$DEV_PID" 2>/dev/null; then
            echo "[run-smoke] Dev server stopped after ${i}s"
            break
        fi
        sleep 1
    done
    if kill -0 "$DEV_PID" 2>/dev/null; then
        echo "[run-smoke] Dev server did not stop in 10s, sending SIGKILL"
        kill -KILL "$DEV_PID" 2>/dev/null || true
        sleep 1
    fi
else
    echo "[run-smoke] No dev server running, going straight to smoke."
fi

# 4-5. Run smoke; save tail-20 to log; check full output for errors.
echo "[run-smoke] Running smoke for task ${TASK_ID}..."
TMP_FULL="$(mktemp)"
trap 'rm -f "$TMP_FULL"' EXIT

"$ODOO_PYTHON" "$ODOO_BIN" -c "$ODOO_CONF" -u "$MODULE" -d "$ODOO_DB" --stop-after-init > "$TMP_FULL" 2>&1
SMOKE_RC=$?

tail -20 "$TMP_FULL" > "$LOG_FILE"

# 6. Check full output for errors.
SMOKE_FAIL=0
if grep -qE 'Traceback' "$TMP_FULL"; then
    echo "[run-smoke] SMOKE FAILED: Traceback detected in output" >&2
    SMOKE_FAIL=1
elif grep -qE '^[^[:space:]]+ ERROR ' "$TMP_FULL"; then
    echo "[run-smoke] SMOKE FAILED: ERROR line detected in output" >&2
    SMOKE_FAIL=1
elif [[ $SMOKE_RC -ne 0 ]]; then
    echo "[run-smoke] SMOKE FAILED: exit code $SMOKE_RC (no Traceback/ERROR matched but odoo-bin exited non-zero)" >&2
    SMOKE_FAIL=1
fi

if [[ $SMOKE_FAIL -eq 1 ]]; then
    FAIL_LOG="${TMP_FULL}.fail"
    cp "$TMP_FULL" "$FAIL_LOG"
    echo "[run-smoke] Last 20 lines saved to $LOG_FILE"
    echo "[run-smoke] Full output preserved at $FAIL_LOG"
    # Try to restart dev server even after smoke failure so we don't leave the system worse.
    if [[ -n "$DEV_ARGS" ]]; then
        echo "[run-smoke] Restarting dev server despite smoke failure..."
        nohup $DEV_ARGS > "$DEV_LOG" 2>&1 &
        NEW_PID=$!
        echo "$NEW_PID" > "$PID_FILE"
        echo "[run-smoke] Dev server restarted as PID=$NEW_PID"
    fi
    exit 1
fi

echo "[run-smoke] SMOKE OK"
echo "[run-smoke] Log saved to $LOG_FILE (last 20 lines)"

# 7-8. Restart dev server if one was previously running.
if [[ -n "$DEV_ARGS" ]]; then
    echo "[run-smoke] Restarting dev server..."
    nohup $DEV_ARGS > "$DEV_LOG" 2>&1 &
    NEW_PID=$!
    echo "$NEW_PID" > "$PID_FILE"
    echo "[run-smoke] Dev server PID=$NEW_PID (logs at $DEV_LOG)"

    # Best-effort wait until it listens.
    for i in $(seq 1 15); do
        if curl -s -o /dev/null -w "%{http_code}" -m 2 http://localhost:14070/web/login 2>/dev/null | grep -qE "200|303"; then
            echo "[run-smoke] Dev server listening after ${i}s"
            break
        fi
        sleep 1
    done
else
    echo "[run-smoke] No previous dev server detected; nothing to restart."
fi

echo "[run-smoke] Done."
exit 0
