#!/usr/bin/env bash
# e2e: install Claude Code via tokenmix and get a real non-interactive reply (claude -p).
set -u
: "${TOKENMIX_TEST_KEY:?TOKENMIX_TEST_KEY env var is required}"
if [ -n "${TM_BIN:-}" ]; then
  # shellcheck disable=SC2206
  TM=($TM_BIN)
else
  TM=(npx -y "tokenmix@${TM_VERSION:-latest}")
fi

"${TM[@]}" login --key "$TOKENMIX_TEST_KEY" >/dev/null 2>&1 || { echo "==> FAIL: login"; exit 1; }

# Non-TTY: 0.4.2 auto-installs Claude Code, then `claude -p` runs non-interactively.
out="$("${TM[@]}" claude -p "Reply with exactly this token and nothing else: CI_CLAUDE_OK" </dev/null 2>&1)"
echo "$out" | sed -E 's/sk-tm-[A-Za-z0-9]+/sk-tm-***/g' | tail -30
echo "----"
if echo "$out" | grep -q "CI_CLAUDE_OK"; then
  echo "==> PASS: claude e2e (real reply routed through TokenMix)"
else
  echo "==> FAIL: claude e2e (no marker reply — see output above)"
  exit 1
fi
