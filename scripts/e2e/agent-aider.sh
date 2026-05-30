#!/usr/bin/env bash
# e2e: install Aider (Python) and get a real non-interactive reply via tokenmix.
set -u
: "${TOKENMIX_TEST_KEY:?TOKENMIX_TEST_KEY env var is required}"
if [ -n "${TM_BIN:-}" ]; then
  # shellcheck disable=SC2206
  TM=($TM_BIN)
else
  TM=(npx -y "tokenmix@${TM_VERSION:-latest}")
fi

echo "installing aider-chat ..."
python -m pip install --quiet --upgrade aider-chat \
  || python3 -m pip install --quiet --upgrade aider-chat \
  || { echo "==> FAIL: aider install"; exit 1; }
command -v aider >/dev/null 2>&1 || { echo "==> FAIL: aider not on PATH after install"; exit 1; }

"${TM[@]}" login --key "$TOKENMIX_TEST_KEY" >/dev/null 2>&1 || { echo "==> FAIL: login"; exit 1; }

# Aider needs a working dir; give it a throwaway git repo.
work="$(mktemp -d)"; cd "$work" || exit 1
git init -q; git config user.email e2e@test.local; git config user.name e2e

out="$("${TM[@]}" aider --yes-always --no-auto-commits --no-check-update \
        --message "Reply with exactly this token and nothing else: CI_AIDER_OK" 2>&1)"
echo "$out" | sed -E 's/sk-tm-[A-Za-z0-9]+/sk-tm-***/g' | tail -30
echo "----"
if echo "$out" | grep -q "CI_AIDER_OK"; then
  echo "==> PASS: aider e2e (real reply routed through TokenMix)"
else
  echo "==> FAIL: aider e2e (no marker reply — see output above)"
  exit 1
fi
