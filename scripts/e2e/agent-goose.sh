#!/usr/bin/env bash
# e2e: install Goose (its official script) and get a real headless reply (goose run -t).
# Goose is a Rust binary installed via a curl script (not npm) — the CLI prints that
# command rather than auto-running it, so CI installs it explicitly here.
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

curl -fsSL https://github.com/block/goose/releases/download/stable/download_cli.sh | CONFIGURE=false bash >/dev/null 2>&1
export PATH="$HOME/.local/bin:$PATH"
command -v goose >/dev/null 2>&1 || { echo "==> FAIL: goose e2e (install)"; exit 1; }

"${TM[@]}" login --key "$TOKENMIX_TEST_KEY" >/dev/null 2>&1 || { echo "==> FAIL: goose e2e (login)"; exit 1; }

# tokenmix injects GOOSE_PROVIDER/GOOSE_MODEL + OPENAI_HOST/OPENAI_API_KEY + GOOSE_DISABLE_KEYRING,
# so `goose run` verifies the full CLI -> goose -> tokenmix chain.
out="$("${TM[@]}" goose run -t "Reply with exactly this token and nothing else: CI_GOOSE_OK" </dev/null 2>&1)"
if echo "$out" | grep -q "CI_GOOSE_OK"; then
  echo "==> PASS: goose e2e (real reply via OpenAI-compatible mode)"
else
  echo "==> FAIL: goose e2e (no marker reply — see output below)"
  echo "$out" | sed -E 's/sk-tm-[A-Za-z0-9]+/sk-tm-***/g' | tail -20
  exit 1
fi
