# Shared CLI resolver for all e2e scripts — sets the TM array used to invoke the CLI.
#
#   TM_BIN     — explicit command (e.g. "node bin/tokenmix.js") to test a local build
#   TM_VERSION — published version or dist-tag to test (default: latest)
#
# For the published path we INSTALL ONCE (with retry) and then call the local
# `tokenmix` binary, rather than re-resolving `npx tokenmix@<ver>` on every command.
# Per-command npx is flaky in CI: an exact-version pin can fail to expose the bin
# (`sh: tokenmix: not found`), and a mid-run npm-registry blip fails random commands.
# A single global install with retry is far more stable across OSes.
if [ -n "${TM_BIN:-}" ]; then
  # shellcheck disable=SC2206
  TM=($TM_BIN)
else
  VER="${TM_VERSION:-latest}"
  ok=0
  for attempt in 1 2 3; do
    if npm install -g "tokenmix@${VER}"; then ok=1; break; fi
    echo "  (npm i -g tokenmix@${VER} attempt ${attempt}/3 failed — transient registry? retrying)" >&2
    sleep 5
  done
  if [ "$ok" != 1 ]; then
    echo "FATAL: could not install tokenmix@${VER} after 3 attempts" >&2
    exit 1
  fi
  TM=(tokenmix)
fi
