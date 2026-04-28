#!/usr/bin/env bash
# scripts/check-xml-comments.sh — XML 1.0 comment validity pre-check.
#
# XML 1.0 §2.5: «within a comment, the string "--" (double-hyphen) MUST
# NOT occur». Odoo's lxml parser raises XMLSyntaxError if violated, but
# only at module load time. This pre-check catches violations BEFORE
# invoking the Odoo smoke, saving the dev/test cycle.
#
# Bug pattern (3rd occurrence by Task 3.10):
#   - Task 3.3 cta_kit_consulting.xml: «Background: --brand-accent (...)»
#   - Task 3.9 equipo.xml:              «(--brand-primary + --neutral-700)»
#   - Both in TEXTUAL descriptive header comments mentioning literal CSS
#     custom property names. SCSS files preserve `--` because there it's
#     valid CSS syntax for custom properties.
#
# Implementation:
#   Uses Python + lxml (already a dep of Odoo) to parse each .xml file
#   under views/ and data/. lxml's parser raises XMLSyntaxError with the
#   message «Comment must not contain '--' (double-hyphen)» on violation.
#   Script greps for that exact message and reports file + line.
#
# Integration:
#   Invoked at the top of `scripts/run-smoke.sh` as a pre-check. If any
#   file fails, smoke aborts with non-zero exit before launching Odoo.
#
# Usage:
#   ./scripts/check-xml-comments.sh
#   ./scripts/check-xml-comments.sh path/to/file.xml [more files...]
#
# Exit codes:
#   0  — all files valid.
#   1  — one or more files have XML syntax errors.
#   2  — script invocation error (e.g., python not found).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

ODOO_PYTHON="/opt/odoo/v14/venv/bin/python"
if [[ ! -x "$ODOO_PYTHON" ]]; then
    echo "[check-xml] ERROR: Odoo python not found at $ODOO_PYTHON" >&2
    exit 2
fi

# Files to validate: explicit args if any, else all .xml in views/ + data/.
if [[ $# -gt 0 ]]; then
    FILES=("$@")
else
    mapfile -t FILES < <(find views data -name '*.xml' -type f 2>/dev/null | sort)
fi

if [[ ${#FILES[@]} -eq 0 ]]; then
    echo "[check-xml] No XML files found to validate."
    exit 0
fi

ERRORS=0
for f in "${FILES[@]}"; do
    if [[ ! -f "$f" ]]; then
        echo "[check-xml] WARN: $f does not exist, skipping" >&2
        continue
    fi
    # Parse with lxml; capture XMLSyntaxError if any.
    OUTPUT="$("$ODOO_PYTHON" -c "
import sys
from lxml import etree
try:
    etree.parse(sys.argv[1])
except etree.XMLSyntaxError as e:
    print(str(e), file=sys.stderr)
    sys.exit(1)
" "$f" 2>&1)" || {
        # Non-zero exit = parse error.
        ERRORS=$((ERRORS+1))
        echo "[check-xml] FAIL: $f" >&2
        echo "$OUTPUT" | sed 's/^/[check-xml]   /' >&2
    }
done

if [[ $ERRORS -gt 0 ]]; then
    echo "[check-xml] $ERRORS XML file(s) failed validation." >&2
    echo "[check-xml] Recall: XML 1.0 §2.5 prohibits '--' inside comments." >&2
    echo "[check-xml] If a CSS custom property name like '--brand-primary'" >&2
    echo "[check-xml] appears in descriptive comment text, drop the leading dashes" >&2
    echo "[check-xml] (write 'brand-primary' or 'var(--brand-primary)' inside <fill> etc)." >&2
    exit 1
fi

echo "[check-xml] ${#FILES[@]} XML file(s) OK."
exit 0
