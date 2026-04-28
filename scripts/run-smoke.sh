#!/usr/bin/env bash
# scripts/run-smoke.sh — automated dev → smoke → restart-dev cycle.
#
# Usage:
#   ./scripts/run-smoke.sh <task-id>
# Example:
#   ./scripts/run-smoke.sh 0.3
#
# Behaviour:
#   1. Detects running Odoo dev server matching ^${ODOO_PYTHON} ${ODOO_BIN} ... --dev=all -d ${ODOO_DB}.
#   2. Captures its argv from /proc/<pid>/cmdline (NUL-separated → array, safe under arg whitespace).
#   3. SIGTERM the dev (wait up to 10s, SIGKILL fallback). Skip if no dev was running.
#   4. Runs smoke: -u website_avanzosc_demo --stop-after-init.
#   5. Saves last 20 lines to docs/smoke-tests/<task-id>.log.
#   6. Fails (exit 1) if full smoke output contains Traceback or ERROR (or odoo-bin exits non-zero).
#   7. On success, restarts the dev server with the captured args (nohup, background).
#   8. Records new PID at /tmp/odoo-dev.pid.
#   9. Strict restart verification — exit 0 only if dev server responds 200/303 on :14070 within 15s.
#      Three failure modes detected with distinct diagnostic messages:
#        a. Immediate death (≤2s)        → "died immediately after restart"
#        b. Death during HTTP polling     → "died before listening on :14070"
#        c. Alive but never responds      → "alive but not listening on :14070"
#      Failure during success-path → exit 1. Failure during post-smoke-fail-path → warning, exit 1 already set for smoke.
#
# Idempotent: running twice in a row is safe.
# Required by CLAUDE.md §12 rule #6.
#
# IMPORTANT: dev server is restarted with an explicit PATH so that
# --dev=all auto-reload uses the venv Python (not /usr/bin/python3 which
# lacks Odoo's dependencies like PyPDF2). Without this, the reloader
# silently kills the dev server every time a file changes.

set -euo pipefail

TASK_ID="${1:-}"
if [[ -z "$TASK_ID" ]]; then
    echo "ERROR: task-id required. Usage: $0 <task-id>" >&2
    exit 2
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

# 0. Pre-check: XML 1.0 comment validity (catches `--` double-hyphen in
# comments before invoking Odoo). Bug pattern recurrente — Tasks 3.3, 3.9,
# 3.10 lo dispararon al menos una vez cada una. Ver scripts/check-xml-comments.sh.
"$SCRIPT_DIR/check-xml-comments.sh" || {
    echo "[run-smoke] Pre-check failed; aborting smoke." >&2
    exit 1
}

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

# 1. Detect running dev server.
# Strategy: PID file is the primary source of truth (we wrote it ourselves),
# pgrep is a fallback. The reason: --dev=all uses os.execvp() on auto-reload,
# which resolves "python" via $PATH and may set argv[0] to bare "python"
# (no full venv path). A strict pgrep pattern anchored to ${ODOO_PYTHON}
# stops matching after such a re-exec, leading to ghost duplicate processes.
# PID survives across exec() so /tmp/odoo-dev.pid remains valid.
DEV_PID=""
if [[ -f "$PID_FILE" ]]; then
    PID_FROM_FILE="$(cat "$PID_FILE" 2>/dev/null || true)"
    if [[ -n "$PID_FROM_FILE" ]] && kill -0 "$PID_FROM_FILE" 2>/dev/null; then
        # Validate it is actually our Odoo dev process (not a stray reuse of the PID).
        CMDLINE="$(tr '\0' ' ' < /proc/"$PID_FROM_FILE"/cmdline 2>/dev/null || true)"
        if [[ "$CMDLINE" == *"$ODOO_BIN"* && "$CMDLINE" == *"--dev=all"* && "$CMDLINE" == *"-d ${ODOO_DB}"* ]]; then
            DEV_PID="$PID_FROM_FILE"
            echo "[run-smoke] Found dev server via PID file: PID=$DEV_PID"
        fi
    fi
fi

# Fallback: pgrep with cmd-line anchored at start; optional non-space path
# prefix (so both "/opt/.../venv/bin/python" and bare "python" match), then
# odoo-bin + --dev=all + -d <db>. The ^ anchor + non-space class avoid
# matching processes (e.g. bash -c '…python …odoo-bin …') whose argv contain
# the literal string but do not begin with the python executable.
# pgrep returns 1 on no match — || true keeps the assignment under set -e.
if [[ -z "$DEV_PID" ]]; then
    DEV_PID="$(pgrep -af "^([^ ]*/)?python[0-9.]* ${ODOO_BIN}.*--dev=all.*-d ${ODOO_DB}" 2>/dev/null | awk '{print $1}' | head -n 1 || true)"
    if [[ -n "$DEV_PID" ]]; then
        echo "[run-smoke] Found dev server via pgrep fallback: PID=$DEV_PID"
    fi
fi

# 2. Capture argv as array via /proc/<pid>/cmdline (NUL-separated, robust under whitespace).
DEV_ARGS_ARR=()
if [[ -n "$DEV_PID" ]]; then
    mapfile -t DEV_ARGS_ARR < <(tr '\0' '\n' < /proc/"$DEV_PID"/cmdline | sed '/^$/d')
    echo "[run-smoke]   args: ${DEV_ARGS_ARR[*]}"

    # 3. SIGTERM, wait up to 10s, SIGKILL fallback.
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
    echo "[run-smoke] No dev server detected (PID file empty/stale and pgrep fallback no match); going straight to smoke."
fi

# 4-5. Run smoke; save tail-20 to log; check full output for errors.
echo "[run-smoke] Running smoke for task ${TASK_ID}..."
TMP_FULL="$(mktemp)"
# Mejora 2: trap covers EXIT, INT, TERM so the temp file is cleaned even on Ctrl+C.
trap 'rm -f "$TMP_FULL"' EXIT INT TERM

# Capture exit code without tripping set -e. SMOKE_RC stays 0 if cmd succeeds.
SMOKE_RC=0
"$ODOO_PYTHON" "$ODOO_BIN" -c "$ODOO_CONF" -u "$MODULE" -d "$ODOO_DB" --stop-after-init > "$TMP_FULL" 2>&1 || SMOKE_RC=$?

tail -20 "$TMP_FULL" > "$LOG_FILE"

# 6. Detect failure modes.
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

# Helper: restart dev server using captured argv. Sets NEW_PID.
# Returns 0 only if PID is alive AND HTTP responds 200/303 within 15s.
# Returns 1 in three failure modes (with distinct diagnostic messages):
#   a. Immediate death (≤2s after nohup)        → "died immediately after restart"
#   b. Death during 15s HTTP polling            → "died before listening on :14070"
#   c. Alive but never responds 200/303 in 15s  → "alive but not listening on :14070"
# Caller decides whether the failure is fatal (success path) or just a warning (fail path).
restart_dev() {
    if [[ ${#DEV_ARGS_ARR[@]} -eq 0 ]]; then
        echo "[run-smoke] No previous dev server captured; nothing to restart."
        NEW_PID=""
        return 0
    fi
    echo "[run-smoke] Restarting dev server..."
    # Explicit PATH (NOT prepend $PATH): determinista, evita contaminación de venvs ajenos.
    # Necesario para que el watchdog de --dev=all use el venv Python en cada reload
    # (su shebang es #!/usr/bin/env python3, que resuelve por $PATH).
    PATH="/opt/odoo/v14/venv/bin:/usr/local/bin:/usr/bin:/bin" nohup "${DEV_ARGS_ARR[@]}" > "$DEV_LOG" 2>&1 &
    NEW_PID=$!
    echo "$NEW_PID" > "$PID_FILE"
    echo "[run-smoke] Dev server PID=$NEW_PID (logs at $DEV_LOG)"

    # Mejora 1 (a): immediate-death detection.
    sleep 2
    if ! kill -0 "$NEW_PID" 2>/dev/null; then
        echo "[run-smoke] dev server PID=$NEW_PID died immediately after restart" >&2
        echo "[run-smoke]   check $DEV_LOG for details" >&2
        return 1
    fi

    # Strict HTTP poll: success only if 200/303 within 15s.
    for i in $(seq 1 15); do
        if curl -s -o /dev/null -w "%{http_code}" -m 2 http://localhost:14070/web/login 2>/dev/null | grep -qE "200|303"; then
            echo "[run-smoke] Dev server listening after ${i}s"
            return 0
        fi
        sleep 1
    done

    # Failure (b) or (c): no HTTP after 15s. Diagnose by checking PID liveness.
    if ! kill -0 "$NEW_PID" 2>/dev/null; then
        echo "[run-smoke] dev server PID=$NEW_PID died before listening on :14070" >&2
    else
        echo "[run-smoke] dev server PID=$NEW_PID alive but not listening on :14070" >&2
    fi
    echo "[run-smoke]   check $DEV_LOG for details" >&2
    return 1
}

if [[ $SMOKE_FAIL -eq 1 ]]; then
    FAIL_LOG="${TMP_FULL}.fail"
    cp "$TMP_FULL" "$FAIL_LOG" || true
    echo "[run-smoke] Last 20 lines saved to $LOG_FILE"
    echo "[run-smoke] Full output preserved at $FAIL_LOG"
    # Try to restart anyway. If restart also fails, just warn — exit 1 is already set for smoke.
    if ! restart_dev; then
        echo "[run-smoke] WARNING: dev server restart did not become healthy (already exiting 1 for smoke fail)" >&2
    fi
    exit 1
fi

echo "[run-smoke] SMOKE OK"
echo "[run-smoke] Log saved to $LOG_FILE (last 20 lines)"

# 7-9. Restart in success path. If restart_dev returns 1 (any of the 3 failure modes), exit 1.
if ! restart_dev; then
    echo "[run-smoke] FAIL: smoke passed but dev server restart did not become healthy" >&2
    exit 1
fi

echo "[run-smoke] Done."
exit 0
