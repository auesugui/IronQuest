#!/usr/bin/env bash
# =============================================================================
# Shadow calculator guard — fails if app/ contains calculation/engine logic
# that should live in src/engine/ or src/lib/.
# =============================================================================
# UIs call engines; they don't re-implement them. A function in app/ whose
# name starts with `calculate` or `compute` is the exact shape of the 2026-06-23
# FP fracture (calculateWorkoutSummary in summary.tsx bypassed calculateSessionFP
# in the real engine — tests passed, user-visible behavior broke silently).
#
# To allow a legitimate exception (e.g., a thin adapter), put a comment on the
# line above the declaration:
#
#   // shadow-check-allow: thin adapter over src/lib/workout-summary
#   const calculateFooBar = (...) => ...
#
# Run locally:   ./scripts/check-shadow-calculators.sh
# Runs in CI:    .github/workflows/ci.yml
# =============================================================================

set -euo pipefail

# Resolve repo root whether invoked from repo root or a subdir.
cd "$(git rev-parse --show-toplevel)"

if [[ ! -d app/ ]]; then
  echo "✓ No app/ directory — nothing to check"
  exit 0
fi

# Match:
#   function calculateFoo( ... )           — function declarations
#   const computeFoo = ( ... )             — arrow function assignments
#   const calculateBar = function ( ... )  — anonymous function assignments
pattern='(function[[:space:]]+(calculate|compute)[A-Za-z0-9_]+|const[[:space:]]+(calculate|compute)[A-Za-z0-9_]+[[:space:]]*=[[:space:]]*(\(|function))'

# grep returns exit 1 on no matches; `|| true` so set -e doesn't kill us.
matches=$(grep -rnE "$pattern" app/ 2>/dev/null || true)

if [[ -z "$matches" ]]; then
  echo "✓ No shadow calculators in app/"
  exit 0
fi

violations=""
allowlisted=""
while IFS= read -r line; do
  [[ -z "$line" ]] && continue
  file=$(echo "$line" | cut -d: -f1)
  lineno=$(echo "$line" | cut -d: -f2)
  prev_line=$((lineno - 1))
  # Read the line above; if it's an allowlist marker, skip.
  prev=$(sed -n "${prev_line}p" "$file" 2>/dev/null || true)
  if [[ "$prev" == *"shadow-check-allow:"* ]]; then
    allowlisted="$allowlisted
$line  (allowlisted)"
    continue
  fi
  violations="$violations
$line"
done <<< "$matches"

if [[ -z "$(echo "$violations" | tr -d '[:space:]')" ]]; then
  echo "✓ All calculator functions in app/ are explicitly allowlisted:"
  echo "$allowlisted"
  exit 0
fi

cat >&2 <<EOF
ERROR: shadow calculator(s) detected in app/

UIs must call engines (src/engine/, src/lib/), not re-implement them.
See .claude/agents/ironquest-engineer.md → "Shadow calculator guard".

Violations:$violations

To allow a legitimate exception, add a comment on the line above the declaration:
  // shadow-check-allow: <reason>

Otherwise, move the logic to src/engine/ or src/lib/ and import it.
EOF
exit 1
