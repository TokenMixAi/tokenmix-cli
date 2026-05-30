#!/usr/bin/env bash
# e2e: install Codex via tokenmix and get a real non-interactive reply (codex exec).
# Codex requires Node 22+ — the workflow pins node 22 for this job.
# Requires env TOKENMIX_TEST_KEY. Optional TM_BIN / TM_VERSION (see cli-core.sh).
set -u
: "${TOKENMIX_TEST_KEY:?TOKENMIX_TEST_KEY env var is required}"
if [ -n "${TM_BIN:-}" ]; then
  # shellcheck disable=SC2206
  TM=($TM_BIN)
else
  TM=(npx -y "tokenmix@${TM_VERSION:-latest}")
fi

TMPHOME="$(mktemp -d)"
export HOME="$TMPHOME" XDG_CONFIG_HOME="$TMPHOME/.config" APPDATA="$TMPHOME/AppData" USERPROFILE="$TMPHOME"

"${TM[@]}" login --key "$TOKENMIX_TEST_KEY" >/dev/null 2>&1 || { echo "==> FAIL: codex e2e (login)"; exit 1; }

# Non-TTY: 0.4.2's confirm() auto-accepts the install, so this installs @openai/codex,
# then `codex exec` runs non-interactively. Verifies the whole CLI → codex → tokenmix
# /v1/responses → Anthropic bridge chain end to end.
out="$("${TM[@]}" codex exec --skip-git-repo-check "Reply with exactly this token and nothing else: CI_CODEX_OK" </dev/null 2>&1)"
if echo "$out" | grep -q "CI_CODEX_OK"; then
  echo "==> PASS: codex e2e (real reply via /responses + Anthropic bridge)"
else
  echo "==> FAIL: codex e2e (no marker reply — see output below)"
  echo "$out" | sed -E 's/sk-tm-[A-Za-z0-9]+/sk-tm-***/g' | tail -20
  exit 1
fi
