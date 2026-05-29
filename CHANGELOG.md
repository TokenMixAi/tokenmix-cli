# Changelog

All notable changes to TokenMix CLI will be documented in this file.

## [0.2.2] - 2026-05-29

### Fixed (all caught by real end-to-end testing)
- **`tokenmix kilo` no longer aborts when VSCode isn't on PATH.** Kilo Code is a config-only agent (VSCode extension); the CLI cannot install the extension for you, so it now always prints the configuration snippet — the user may be copying it for another machine.
- **`tokenmix <agent> --version` (and any other agent flag) is now forwarded to the underlying binary** instead of being eaten by commander. Enabled commander's `enablePositionalOptions()` + `passThroughOptions()` on every agent subcommand. Verified: `tokenmix claude --version` now writes `~/.claude/settings.json` then prints Claude Code's own version.
- **`tokenmix aider` gives a friendlier next step.** Instead of just exiting with a hint, it now explicitly says "Run this in another terminal: `pip install aider-chat`, then come back" so the user knows their TokenMix login persists.

## [0.2.1] - 2026-05-25

### Fixed
- `tokenmix --version` now reads from `package.json` instead of a hardcoded string (v0.2.0 still reported `0.1.0` because of this bug).

## [0.2.0] - 2026-05-25

### Added
- **Browser device authorization** for `tokenmix login` (OAuth 2.0 Device Authorization Grant, RFC 8628). No more pasting `sk-tm-...` manually:
  ```
  $ tokenmix login
    Open the link below and confirm this code:
    ABCD-2345
    Link: https://tokenmix.ai/device?user_code=ABCD-2345
  ```
- `tokenmix login --paste` falls back to the v0.1 manual-paste flow when no browser is available.
- `tokenmix login --key sk-tm-...` still works for CI / scripted environments (unchanged).
- New error handling for OAuth standard codes: `authorization_pending` / `slow_down` / `expired_token` / `access_denied`.

### Requires
- Backend must expose `/api/auth/device/code`, `/api/auth/device/token`, `/api/user/device/lookup`, `/api/user/device/authorize` (shipped together with this CLI release).

## [0.1.0] - 2026-05-25

First public release.

### Added
- `tokenmix login [--key sk-tm-xxx]` — log in by pasting an API key from https://tokenmix.ai/dashboard/keys
- `tokenmix logout` — remove stored credentials from the machine
- `tokenmix balance` / `tokenmix topup` — open the dashboard in your browser
- `tokenmix models [--type chat|image|video|...]` — list all 162 active models with prices
- `tokenmix list` — list supported coding agents
- `tokenmix doctor` — diagnose CLI configuration and per-agent install status

### Agent integrations
- **OpenCode** (`tokenmix opencode`) — full auto: `npm install -g opencode-ai` + write `~/.config/opencode/opencode.json` + launch
- **Claude Code** (`tokenmix claude`) — full auto: `npm install -g @anthropic-ai/claude-code` + set `ANTHROPIC_BASE_URL` / `ANTHROPIC_API_KEY` in `~/.claude/settings.json` + launch
- **Aider** (`tokenmix aider`) — semi auto: detect Python, set `OPENAI_API_KEY` / `OPENAI_API_BASE` env on launch, inject `--model openai/<default>` if not specified
- **Kilo Code** (`tokenmix kilo`) — config-only: print configuration JSON for VSCode extension

### Notes
- Config is stored at `~/Library/Application Support/tokenmix/config.json` (macOS), `~/.config/tokenmix/config.json` (Linux, respects `XDG_CONFIG_HOME`), or `%APPDATA%/tokenmix/config.json` (Windows), with file mode `0600`.
- `tokenmix balance` opens the dashboard because v0.1 uses API-key auth which cannot read account-level wallet endpoints. v0.2 (planned) will add OAuth device flow so balance can be queried directly from the CLI.

### Roadmap
- **v0.2** — Browser OAuth device flow (no more pasting API keys); `tokenmix balance` reads `/api/user/wallet` directly
- **v0.3** — `@tokenmix/opencode` plugin: toast in OpenCode showing balance, low-balance prompt, agent-callable `tokenmix_recharge` / `tokenmix_route_health` tools
- **v0.4** — Chinese-first UI and locale-aware prompts (matches tokenmix.ai's 6-language support)
- **Future** — Cline / Roo / Continue / Codex integrations gated on data showing user demand
