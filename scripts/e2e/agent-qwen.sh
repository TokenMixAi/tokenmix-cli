#!/usr/bin/env bash
# e2e: install Qwen Code via tokenmix and get a real headless reply (qwen -p).
# Qwen Code requires Node 22+ — the workflow pins node 22 for this job.
# Requires env TOKENMIX_TEST_KEY. Optional TM_BIN / TM_VERSION (see cli-core.sh).
set -u
: "${TOKENMIX_TEST_KEY:?TOKENMIX_TEST_KEY env var is required}"
# shellcheck source=resolve-tm.sh
. "$(dirname "$0")/resolve-tm.sh"

TMPHOME="$(mktemp -d)"
export HOME="$TMPHOME" XDG_CONFIG_HOME="$TMPHOME/.config" APPDATA="$TMPHOME/AppData" USERPROFILE="$TMPHOME"

"${TM[@]}" login --key "$TOKENMIX_TEST_KEY" >/dev/null 2>&1 || { echo "==> FAIL: qwen e2e (login)"; exit 1; }

# Non-TTY auto-install, then `qwen -p` runs headless. tokenmix injects --auth-type
# openai + OPENAI_* env, so this verifies the CLI → qwen → tokenmix chain end to end.
out="$("${TM[@]}" qwen -p "Reply with exactly this token and nothing else: CI_QWEN_OK" </dev/null 2>&1)"
if echo "$out" | grep -q "CI_QWEN_OK"; then
  echo "==> PASS: qwen e2e (real reply via OpenAI-compatible mode)"
else
  echo "==> FAIL: qwen e2e (no marker reply — see output below)"
  echo "$out" | sed -E 's/sk-tm-[A-Za-z0-9]+/sk-tm-***/g' | tail -20
  exit 1
fi
