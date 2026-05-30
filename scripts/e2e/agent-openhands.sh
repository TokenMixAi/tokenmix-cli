#!/usr/bin/env bash
# e2e: install OpenHands (via uv, needs Python 3.12) + a real headless reply.
# OpenHands is a Python tool — the CLI prints the install cmd; CI installs it here.
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

curl -LsSf https://astral.sh/uv/install.sh | sh >/dev/null 2>&1
export PATH="$HOME/.local/bin:$PATH"
uv tool install openhands --python 3.12 >/dev/null 2>&1
command -v openhands >/dev/null 2>&1 || { echo "==> FAIL: openhands e2e (install)"; exit 1; }

"${TM[@]}" login --key "$TOKENMIX_TEST_KEY" >/dev/null 2>&1 || { echo "==> FAIL: openhands e2e (login)"; exit 1; }

# tokenmix injects LLM_* env + --override-with-envs, so this verifies the full
# CLI -> openhands -> tokenmix chain. Run in the throwaway HOME so the agent has a
# clean workspace.
cd "$TMPHOME"
out="$("${TM[@]}" openhands --headless -t "Reply with exactly the token CI_OPENHANDS_OK and nothing else, then finish." --exit-without-confirmation </dev/null 2>&1)"
if echo "$out" | grep -q "CI_OPENHANDS_OK"; then
  echo "==> PASS: openhands e2e (real reply via LiteLLM/OpenAI-compatible)"
else
  echo "==> FAIL: openhands e2e (no marker reply — see output below)"
  echo "$out" | sed -E 's/sk-tm-[A-Za-z0-9]+/sk-tm-***/g' | tail -20
  exit 1
fi
