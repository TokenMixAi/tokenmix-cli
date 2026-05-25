# Changelog

All notable changes to TokenMix CLI will be documented in this file.

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
