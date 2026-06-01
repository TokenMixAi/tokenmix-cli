#!/usr/bin/env bash
# e2e: core CLI commands that need NO agent install. Runs on linux / macos / windows(git-bash).
# Requires env TOKENMIX_TEST_KEY. Optional: TM_BIN (e.g. "node bin/tokenmix.js" to test the local
# build) or TM_VERSION (defaults to "latest", i.e. what real users get via npx).
set -u

: "${TOKENMIX_TEST_KEY:?TOKENMIX_TEST_KEY env var is required}"
# shellcheck source=resolve-tm.sh
. "$(dirname "$0")/resolve-tm.sh"

# Isolate config into a throwaway HOME so CI state never leaks between steps.
TMPHOME="$(mktemp -d)"
export HOME="$TMPHOME"
export XDG_CONFIG_HOME="$TMPHOME/.config"
export APPDATA="$TMPHOME/AppData"      # Windows config root (%APPDATA%/tokenmix)
export USERPROFILE="$TMPHOME"          # Windows os.homedir()

# Resolve repo root so we can find validate-kilo.mjs regardless of cwd.
HERE="$(cd "$(dirname "$0")" && pwd)"

fail=0
ok()  { echo "  PASS: $1"; }
nope(){ echo "  FAIL: $1"; fail=1; }
mask(){ sed -E 's/sk-tm-[A-Za-z0-9]+/sk-tm-***/g'; }

echo "## tokenmix version (what this run tests)"
"${TM[@]}" --version || nope "version"

echo "## un-logged-in agent run must refuse with a clear message"
out="$("${TM[@]}" opencode run "hi" </dev/null 2>&1 || true)"
echo "$out" | grep -qiE "not logged in|log ?in" && ok "no-login refused" || nope "no-login not refused -> $out"

echo "## malformed key (no sk-tm- prefix) rejected immediately"
out="$("${TM[@]}" login --key "definitely-not-a-key" 2>&1 || true)"
echo "$out" | grep -qi "sk-tm-" && ok "malformed key rejected" || nope "malformed -> $out"

echo "## login with the real test key"
if "${TM[@]}" login --key "$TOKENMIX_TEST_KEY" >/dev/null 2>&1; then ok "login"; else nope "login failed"; fi

echo "## doctor reports the key valid (retried — doctor's verify has a 15s network timeout)"
dok=0
for attempt in 1 2 3; do
  out="$("${TM[@]}" doctor 2>&1)"
  if echo "$out" | grep -qiE "is valid"; then dok=1; break; fi
  echo "  (attempt $attempt didn't report valid — likely a transient verify timeout; retrying)"
  sleep 3
done
[ "$dok" = 1 ] && ok "doctor: key valid" || nope "doctor -> $(echo "$out" | mask)"

echo "## a failed (wrong) login must NOT overwrite stored good creds"
"${TM[@]}" login --key "sk-tm-WRONG0000000000000000000000000000" >/dev/null 2>&1 || true
out="$("${TM[@]}" doctor 2>&1)"
echo "$out" | grep -qiE "valid" && ok "stored creds survived a wrong login" || nope "creds lost after wrong login"

echo "## models --type chat lists priced models"
out="$("${TM[@]}" models --type chat 2>&1)"
echo "$out" | grep -qiE "Chat|/M|per|token" && ok "models listed" || nope "models -> $out"

echo "## list shows the supported agents"
out="$("${TM[@]}" list 2>&1)"
echo "$out" | grep -qi "opencode" && ok "list shows agents" || nope "list -> $out"

echo "## kilo prints a valid, parseable JSON config"
if "${TM[@]}" kilo 2>&1 | node "$HERE/validate-kilo.mjs"; then ok "kilo JSON valid"; else nope "kilo JSON invalid"; fi

echo "## cline / roo print OpenAI-Compatible settings (config-only, no LLM call)"
for ag in cline roo; do
  out="$("${TM[@]}" "$ag" 2>&1)"
  if echo "$out" | grep -qi "OpenAI Compatible" && echo "$out" | grep -q "/v1" && echo "$out" | grep -q "sk-tm-"; then
    ok "$ag config printed"
  else
    nope "$ag config -> $(echo "$out" | mask | head -3)"
  fi
done

echo "## continue prints a config.yaml block with an openai provider"
out="$("${TM[@]}" continue 2>&1)"
if echo "$out" | grep -q "provider: openai" && echo "$out" | grep -q "apiBase" && echo "$out" | grep -q "models:"; then
  ok "continue yaml printed"
else
  nope "continue -> $(echo "$out" | mask | head -5)"
fi

echo "## list includes all 11 agents (incl. cline/roo/continue/codex/qwen/goose/openhands)"
out="$("${TM[@]}" list 2>&1)"
missing=""
for ag in opencode claude aider kilo cline roo continue codex qwen goose openhands; do
  echo "$out" | grep -qE "^  $ag " || missing="$missing $ag"
done
[ -z "$missing" ] && ok "all 11 agents listed" || nope "missing agents:$missing"

echo "## balance command runs cleanly (amount intentionally not echoed)"
if "${TM[@]}" balance >/dev/null 2>&1; then ok "balance ran"; else nope "balance failed"; fi

echo
if [ "$fail" = 0 ]; then echo "==> CLI-CORE E2E: ALL PASSED"; else echo "==> CLI-CORE E2E: FAILURES ABOVE"; exit 1; fi
