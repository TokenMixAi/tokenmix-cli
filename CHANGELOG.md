# Changelog

All notable changes to TokenMix CLI are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.5] - 2026-06-02

### Added

- **`TOKENMIX_API_BASE` to override the gateway endpoint at runtime.** Point the CLI at a self-hosted or backup gateway (handy on slow or restricted networks) without touching your stored config. The env value takes precedence for the current run but is never written to disk, so `login` still persists only an explicit `--url`. The "Slow or restricted networks" section of the README now also covers installing through a package-registry mirror.

### Changed

- **Repository housekeeping for a global audience.** Inline code comments and documentation are now uniformly English, and punctuation was normalized across the codebase, CI configuration, and scripts. No runtime behavior changes.

## [1.5.4] - 2026-06-01

### Added
- **Mirror / proxy hint for slow or restricted networks.** When an npm-based agent fails to install, the CLI now suggests a registry mirror (`npm config set registry https://registry.npmmirror.com`) or a proxy - aimed at users on slow or firewalled connections (e.g. mainland China, where the npm registry is reachable but slow). Localized in all six languages. (Note: this only helps the npm install step; whether the gateway and GitHub/PyPI-based agents are reachable behind the GFW still needs real in-region verification - it can't be solved in the CLI.)

## [1.5.3] - 2026-06-01

### Fixed

A second deep review of the remaining paths (commands, agent config, i18n). Each fix has a test.

- **Unknown commands now error instead of silently showing the welcome screen.** `tokenmix balnce` (a typo) used to print the get-started screen and exit 0; it now reports the unknown command and exits 1.
- **An API key pasted with leading whitespace is accepted.** The validator checked the untrimmed value, rejecting `"  sk-tm-…"` (common when copying from the dashboard) even though it trims fine.
- **`tokenmix <agent> --help` now reaches the agent** (e.g. shows OpenCode's own help) instead of tokenmix's wrapper help.
- **Codex / Continue config is escaped properly.** A model or base URL with special characters (`"`, `:`, `#`, newlines) no longer breaks Codex's TOML provider config or the Continue YAML snippet (and can't inject extra config keys).
- **OpenHands model prefix** is no longer doubled (`openai/openai/…`) when the model already includes a provider prefix.
- **`t()` placeholder interpolation is single-pass** - a value that itself contains `{token}` is no longer re-substituted by a later parameter.

## [1.5.2] - 2026-06-01

### Fixed

A hardening pass after a deep review of the most dangerous code paths: config writes, login, and the agents that edit your `~/.claude/settings.json`. Every fix ships with a regression test.

- **Config files are now written atomically** (temp file + rename). A crash or a concurrent write mid-`writeFile` could previously truncate `~/.claude/settings.json`, your `config.json`, or `opencode.json` to 0 bytes - corrupting your Claude Code setup or silently dropping your saved login. `readConfig` now also distinguishes a corrupt config from a missing one (it warns instead of looking silently logged-out).
- **`tokenmix claude` no longer crashes on a malformed `settings.json`.** A file containing the JSON literal `null` (or an array) used to throw `Cannot read properties of null` and block launch; it is now treated as a fresh start.
- **A gateway 5xx/429 is no longer reported as an invalid key.** `login` and `doctor` used to tell you to re-create a perfectly good key when the API was merely down; they now say it is temporarily unavailable.
- **`tokenmix topup` / `balance` always print the dashboard URL** before trying to open a browser - so on a headless / SSH / container machine you get the link instead of nothing.
- **Device-flow login is hardened** against a misbehaving server: the poll interval and deadline are clamped (no busy-loop from absurd values), a success response with no token is rejected instead of saving an empty login, and a progress-callback error can no longer abort the flow.
- **Robustness:** `TOKENMIX_TIMEOUT_MS` now ignores non-positive/garbage values; a string error `code` from the API is no longer silently swallowed; a missing browser launcher can no longer crash the process.

## [1.5.1] - 2026-06-01

Quality-tooling follow-up to 1.5.0. No change to runtime behavior.

### Added
- **Test coverage reporting** - `pnpm test:coverage` (via `@vitest/coverage-v8`).
- **Pre-commit hook** - husky + lint-staged auto-run ESLint + Prettier on staged files before each commit.

### Changed
- **Enabled `noUncheckedIndexedAccess`** for stricter array/object index safety (two `.split()[0]` sites guarded; behavior unchanged).
- **Bumped GitHub Actions** `actions/checkout` and `actions/setup-node` to v5 (Node 24 runtime), ahead of the June 2026 Node 20 deprecation.

## [1.5.0] - 2026-06-01

A codebase-quality release. **No change to how the CLI behaves** - same commands, same agents, same output - but a substantial internal cleanup and a full quality-tooling baseline, verified by an independent behavior-equivalence review plus typecheck / lint / format / build / 103 tests all green. Safe to upgrade.

### Added
- **Lint + format tooling.** ESLint (flat config, typescript-eslint) and Prettier, wired as `pnpm lint` / `pnpm format` / `pnpm format:check`, enforced by a dedicated CI job, with an `.editorconfig`.
- **Open-source governance.** `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, issue/PR templates, README status badges, and a Keep a Changelog / Semantic Versioning declaration.

### Changed
- **De-duplicated the agent layer.** Four shared helpers (`probeVersion`, `npmInstallCheck`, `npmInstallGlobal`, `vscodeConfigOnlyCheck`) replace ~14 copies of the same install-check / install boilerplate across the agents; the default model, the `/v1` URL join, and the dashboard URLs are now single sources of truth. Behavior unchanged (independently reviewed).
- **Stricter TypeScript:** enabled `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, and `noImplicitOverride`.
- **More honest `unwrap()` typing** and a `balance` error path that surfaces the failure reason, consistent with `doctor` / `login`.

### Fixed
- **`repository` URL in `package.json`** pointed at the wrong org (`tokenmix/` → `TokenMixAi/`); added `bugs` and `author` fields.

### Removed
- Dead code (`findAgent`, an unused `select` / `SelectChoice` prompt helper, two never-read `UserConfig` fields) and a stale internal QA report.

## [1.4.17] - 2026-05-30

### Fixed
- **`tokenmix doctor` no longer contradicts itself when logged out.** The Aider "not installed" hint used to claim "your TokenMix login is already saved" even on a logged-out machine, and its last line lost its indentation. It now shows just the install command, cleanly aligned - fixed in all six languages.
- **Config-only agents are labeled honestly in `doctor`.** Kilo / Cline / Roo / Continue are VSCode extensions with no binary to install, so `doctor` showed a confusing "✓ installed" right next to "VSCode not detected". They now read **config-only (VSCode)**, matching `tokenmix list`.

## [1.4.16] - 2026-05-30

### Changed
- **The first-run screen now leads with why TokenMix is different.** Bare `tokenmix` shows a one-line, code-backed value proposition under the title - *the model you pick is the model you get, no silent swaps, billed at real usage* - so a newcomer sees the differentiator before the get-started steps. Localized in all six languages.
- **README gains a "TokenMix vs. the grey market" comparison.** A four-row table (the model you get, billing, cache savings, your credentials) contrasting TokenMix with typical trust-broken proxy services - every row backed by the gateway's actual behavior - plus an honest note on how TokenMix differs in focus from a mainstream gateway like OpenRouter (built for Asia/China BYOK users), without disparaging it.

## [1.4.15] - 2026-05-30

**First stable (1.x) release.** The CLI is production-ready and moves out of 0.x: 11 coding agents (OpenCode, Claude Code, Aider, Kilo, Cline, Roo Code, Continue, Codex, Qwen Code, Goose, OpenHands) wired and verified end-to-end across Linux / macOS / Windows, faithful model routing, transparent billing, prompt-cache discounts, network resilience, and a localized first-run experience in six languages. Same codebase as 0.4.15 - this tags the 1.x milestone.

## [0.4.15] - 2026-05-30

### Changed
- **"Where do I get a key?" links in the key prompts.** The `sk-tm-` format error and the "no API key provided" message now point to https://tokenmix.ai/dashboard/keys, so a first-timer isn't left guessing where to get one. Localized in all six languages.

## [0.4.14] - 2026-05-30

### Changed
- **More resilient on slow / flaky / restricted networks.** API calls (login, doctor, balance, models, device-flow) now auto-retry transient transport failures with exponential backoff - a single network hiccup no longer fails the command. The timeout is configurable via `TOKENMIX_TIMEOUT_MS` (default 20s, up from 15s; raise it on slow or proxied/firewalled connections), and the "couldn't reach the API" error now suggests checking your proxy too. HTTP errors (like a bad key) are never retried. Most relevant for users on restricted or high-latency networks.

## [0.4.13] - 2026-05-30

### Added
- **A friendly first-run welcome screen.** Running bare `tokenmix` (no command) now shows a short, localized "get started" guide - log in → `tokenmix list` → launch an agent - instead of raw command help. It adapts to whether you're already logged in, and is translated in all six languages. (`tokenmix --help` still shows the full command reference.) Improves the very first thing a new user sees.

## [0.4.12] - 2026-05-30

### Added
- **`TOKENMIX_DEFAULT_MODEL` env to override the default model.** Until now the CLI always defaulted to `claude-sonnet-4.6` with no way to change it from the CLI. Set `TOKENMIX_DEFAULT_MODEL` (e.g. `claude-haiku-4.5` or `qwen-flash`) to pick a cheaper/faster default for any agent launch. The e2e suite now uses this to run against near-free models (`qwen-flash` at ~$0.02/M, or `claude-haiku-4.5` for the Anthropic/Responses agents) instead of burning Sonnet on every CI run.

## [0.4.11] - 2026-05-30

### Added
- **OpenHands support (`tokenmix openhands`).** [OpenHands](https://github.com/All-Hands-AI/OpenHands) - the autonomous coding agent - now runs on TokenMix, wired via LiteLLM env (`LLM_API_KEY` / `LLM_MODEL=openai/<model>` / `LLM_BASE_URL`) injected with `--override-with-envs` at launch (no Docker; your saved OpenHands config untouched). Install needs Python 3.12+ (`uv tool install openhands --python 3.12`), which the CLI prints. Verified end-to-end. Localized in all six languages - **11 agents total**, which closes out the mainstream BYOK CLI candidate pool.

## [0.4.10] - 2026-05-30

### Added
- **Goose support (`tokenmix goose`).** [Goose](https://github.com/block/goose) - Block's on-machine open-source AI agent - now runs on TokenMix in OpenAI-compatible mode (`GOOSE_PROVIDER=openai` + `OPENAI_HOST` / `OPENAI_API_KEY`, with `GOOSE_DISABLE_KEYRING` for non-interactive use). Goose installs via its own script, which the CLI **prints rather than auto-running** a `curl | bash`; once it's installed, `tokenmix goose` wires and launches it. Verified end-to-end. Localized in all six languages - brings the total to **10 agents**.

## [0.4.9] - 2026-05-30

### Added
- **Qwen Code support (`tokenmix qwen`).** [Qwen Code](https://github.com/QwenLM/qwen-code) - Alibaba's terminal coding agent (a Gemini CLI fork), popular with developers in Asia - is now wired to TokenMix, running in OpenAI-compatible mode. `tokenmix qwen` installs `@qwen-code/qwen-code`, sets `OPENAI_API_KEY` / `OPENAI_BASE_URL` / `OPENAI_MODEL`, and launches `qwen --auth-type openai`; your `~/.qwen/settings.json` is left untouched. Verified end-to-end against the gateway. Localized in all six languages.

### Fixed
- **Friendly error when an agent needs a newer Node.** Codex and Qwen Code require Node 22+; on Node 18/20 they previously failed with a cryptic npm error. `tokenmix <agent>` now checks the agent's minimum Node version up front and tells you to upgrade - with your TokenMix login preserved.

## [0.4.8] - 2026-05-30

### Added
- **`tokenmix models --search <keyword>`** filters the (160+) model list by name, and models are now sorted within each type - finding a specific model is no longer a scroll.
- **A "Why TokenMix" section in the README** - a short, honest summary of what the gateway actually gives you: transparent real-time billing, automatic prompt-cache discounts, one key across the OpenAI / Anthropic / Responses protocols, and non-invasive agent config. (Only claims verifiable in this codebase - no policy promises we can't back.)

### Changed
- **Progress messages now go to stderr.** Lines like "Configuring…" / "Launching…" no longer pollute stdout, so `tokenmix kilo > config.txt`, piping an agent, or scripting `tokenmix balance` produce clean output. Command output - balance figures, the `doctor` report, model lists, config snippets - stays on stdout.

## [0.4.7] - 2026-05-30

### Added
- **Codex support (`tokenmix codex`).** [Codex](https://github.com/openai/codex), OpenAI's coding-agent CLI, is now wired to TokenMix. `tokenmix codex` installs it if needed (`npm i -g @openai/codex`) and launches it with TokenMix registered as a custom OpenAI-compatible provider - injected entirely via `--config` overrides at launch (`wire_api = "responses"`, matching Codex 0.135+ and tokenmix's Codex-facing Responses API gateway), with the API key passed through an env var. Your `~/.codex/config.toml` and Codex login are never touched. Localized in all six languages.

## [0.4.6] - 2026-05-30

### Added
- **Roo Code support (`tokenmix roo`).** [Roo Code](https://github.com/RooCodeInc/Roo-Code) (a Cline fork) is now wired to TokenMix as a config-only agent: the CLI prints the OpenAI-Compatible provider settings (Base URL, API key, model ID) to enter in its settings panel, localized in all six languages.
- **Continue support (`tokenmix continue`).** [Continue](https://github.com/continuedev/continue) (VSCode / JetBrains) is now supported. The CLI prints a ready-to-paste `~/.continue/config.yaml` block - verified schema: top-level `name`/`version`/`schema` plus an OpenAI-compatible `models:` entry (`provider: openai`, `apiBase`, `apiKey`, `model`). We print rather than write the file, so an existing `~/.continue/config.yaml` is never clobbered. Localized in all six languages.

## [0.4.5] - 2026-05-30

### Added
- **Cline support (`tokenmix cline`).** [Cline](https://github.com/cline/cline) - the fast-growing BYOK coding agent in the VSCode sidebar - is now wired to TokenMix. Like `tokenmix kilo` it is config-only: the CLI prints the exact OpenAI-Compatible provider settings (Base URL, API key, model ID) to enter in Cline's settings panel, localized in all six languages.

## [0.4.4] - 2026-05-30

### Changed
- `tokenmix models` now shows `$0` for free models instead of `-` (which read as "unknown price").
- The published npm package no longer ships `.js.map` sourcemaps - smaller install, and they aren't useful to CLI users.

### Fixed
- The top-level error handler no longer prints `[object Object]` for a non-Error throw.

## [0.4.3] - 2026-05-30

### Fixed
- **`tokenmix logout` now restores your own Anthropic credentials.** If you had your own `ANTHROPIC_API_KEY` in `~/.claude/settings.json`, `tokenmix claude` overwrote it and a later `tokenmix logout` previously left Claude Code without a key. The original credentials are now stashed on overwrite and restored on logout.

### Added
- **Warning when TokenMix would bypass a Claude Pro/Max subscription.** Claude Code prefers `ANTHROPIC_API_KEY` over an OAuth subscription, so injecting our key silently switches subscribers to pay-per-token. `tokenmix claude` now detects a file-based subscription login (`~/.claude/.credentials.json`) and warns that `tokenmix logout` restores the subscription. (Keychain-stored credentials can't be detected from a file.)

## [0.4.2] - 2026-05-29

### Fixed
- **Non-interactive agent launch no longer silently no-ops.** Running e.g. `tokenmix opencode` in a non-TTY (CI, piped, no terminal) previously rendered an unanswerable "Install now?" prompt and then exited 0 without installing or launching anything. The install confirmation now takes its default (yes) when there is no TTY, so non-interactive `tokenmix <agent>` installs and launches as expected. (The device-flow login retry is correctly *not* auto-retried in a non-TTY, so it can't loop.)
- **Network failures are no longer mistaken for a bad key.** `tokenmix login --key` and `tokenmix doctor` now distinguish "couldn't reach the API" (offline / DNS / firewall / outage) from a genuinely invalid key - a valid key on a flaky network no longer reports "verification failed" / "did NOT validate".

### Changed
- `balance` command `--help` text now reflects that it shows your live balance (it previously read only "open the dashboard").

## [0.4.1] - 2026-05-29

### Added
- **`tokenmix balance` now shows your live balance in the terminal** - available balance, gift credit, total spent (and any in-flight reserved amount) - via the API-key-authenticated `GET /v1/wallet`, localized in all six languages. Falls back to opening the dashboard if the call fails.

## [0.4.0] - 2026-05-29

### Added
- **Four more UI languages: 日本語 / 한국어 / Español / Français** - the CLI now speaks the same six languages as tokenmix.ai (English, 中文, 日本語, 한국어, Español, Français). Auto-detected from the system locale; override with `TOKENMIX_LANG`. Locale detection is now generic - any catalog's primary language subtag is supported - so adding a language is a single `typeof en` catalog file with compile-time-checked completeness.

## [0.3.1] - 2026-05-29

### Added
- **Localization now covers the rest of the UI**: command/option descriptions in `--help`, every agent's configuration notes (OpenCode / Claude Code / Aider / Kilo), and agent install hints - so a `zh` user sees Chinese end-to-end. (commander's structural labels - Usage / Options / Commands - remain English.)

### Changed
- Agents expose `installCmd` so install-failure guidance prints the exact command directly, replacing a fragile prefix-stripping regex.

## [0.3.0] - 2026-05-29

### Added
- **Localized CLI output (中文 / English).** All runtime messages - login, agent install/configure/launch, errors, `doctor`, `list`, `models` - now render in the user's language. Language is auto-detected from the system locale (`LANG` / `LC_ALL` / `LC_MESSAGES`) and can be forced with `TOKENMIX_LANG=zh` or `TOKENMIX_LANG=en`. Translations are compile-time-complete (a missing key fails the build), and adding another language is a single catalog file. (Command `--help` descriptions and agent configuration notes remain English for now.)

## [0.2.4] - 2026-05-29

### Added
- **Cross-platform CI matrix.** Tests now run on Linux, macOS, and Windows across Node 20/22, plus a Node 18 runtime smoke - so "works everywhere" is actually verified, not assumed.

### Fixed
- **Friendlier failure when a global agent install can't write.** `npm install -g` permission errors (the most common first-run snag worldwide) now print actionable guidance - use a Node version manager, or install manually - instead of dumping a raw error.
- **Clearer network errors.** Calls that can't reach the API now say so plainly ("Could not reach the TokenMix API … check your internet connection"), with the underlying cause in parentheses.
- **`tokenmix claude` warns before replacing your own Anthropic config** in `~/.claude/settings.json` (e.g. a Claude Pro/Max login or a personal key) instead of silently hijacking your primary Claude Code setup.
- README: corrected the model count (160+) and the `logout` description.

## [0.2.3] - 2026-05-29

### Added
- **Automated test + CI safety net.** A Vitest suite now covers the most regression-prone code: commander argument pass-through (`tokenmix <agent> --version/--help`), `/api/models` response unwrapping, and the device-authorization polling loop (pending / slow_down / access_denied / transient-network-retry), plus round-trip config cleanup. GitHub Actions runs typecheck + tests + build on every push and PR.

### Fixed
- **`tokenmix logout` now reverts the config it injected into agents.** Previously logout only deleted TokenMix's own credentials, leaving `ANTHROPIC_BASE_URL` / `ANTHROPIC_API_KEY` in `~/.claude/settings.json` and the `tokenmix` provider in `opencode.json` - so those agents kept trying to route through TokenMix with a now-removed key. Cleanup is precise: it only removes entries it recognizes as its own (a `sk-tm-` key / tokenmix base URL / `tokenmix` provider / a `tokenmix/` model pin) and never touches a user's own credentials.
- **`tokenmix <agent> --version` / `--help` no longer rewrites global config.** These informational flags are forwarded straight to the underlying binary without writing `~/.claude/settings.json` or `opencode.json`, and without requiring login - a query shouldn't have side effects.
- **Device-authorization robustness.** The polling loop now defaults the interval (5s) and expiry (15m) when the server omits them - previously a missing `interval` could busy-loop and a missing `expires_in` could time out instantly. Login also falls back to `verification_uri` when the optional `verification_uri_complete` is absent (RFC 8628).
- **`tokenmix balance` / `tokenmix topup` no longer crash on headless machines.** If no browser can be launched they print the URL to open manually instead of throwing.
- **Aider no longer injects a conflicting `--model`** when you pass one of its built-in alias flags (`--sonnet`, `--opus`, `--deepseek`, …).
- **`tokenmix kilo`** now reminds you to keep the printed API key private.

### Internal
- Split CLI construction (`buildProgram()` in `src/program.ts`) from execution (`src/cli.ts`) so the command wiring is unit-testable without triggering real install/configure/launch side effects.
- Deduplicated the default API base URL behind a single exported `DEFAULT_API_BASE` constant.

## [0.2.2] - 2026-05-29

### Fixed (all caught by real end-to-end testing)
- **`tokenmix kilo` no longer aborts when VSCode isn't on PATH.** Kilo Code is a config-only agent (VSCode extension); the CLI cannot install the extension for you, so it now always prints the configuration snippet - the user may be copying it for another machine.
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
- `tokenmix login [--key sk-tm-xxx]` - log in by pasting an API key from https://tokenmix.ai/dashboard/keys
- `tokenmix logout` - remove stored credentials from the machine
- `tokenmix balance` / `tokenmix topup` - open the dashboard in your browser
- `tokenmix models [--type chat|image|video|...]` - list all 162 active models with prices
- `tokenmix list` - list supported coding agents
- `tokenmix doctor` - diagnose CLI configuration and per-agent install status

### Agent integrations
- **OpenCode** (`tokenmix opencode`) - full auto: `npm install -g opencode-ai` + write `~/.config/opencode/opencode.json` + launch
- **Claude Code** (`tokenmix claude`) - full auto: `npm install -g @anthropic-ai/claude-code` + set `ANTHROPIC_BASE_URL` / `ANTHROPIC_API_KEY` in `~/.claude/settings.json` + launch
- **Aider** (`tokenmix aider`) - semi auto: detect Python, set `OPENAI_API_KEY` / `OPENAI_API_BASE` env on launch, inject `--model openai/<default>` if not specified
- **Kilo Code** (`tokenmix kilo`) - config-only: print configuration JSON for VSCode extension

### Notes
- Config is stored at `~/Library/Application Support/tokenmix/config.json` (macOS), `~/.config/tokenmix/config.json` (Linux, respects `XDG_CONFIG_HOME`), or `%APPDATA%/tokenmix/config.json` (Windows), with file mode `0600`.
- `tokenmix balance` opens the dashboard because v0.1 uses API-key auth which cannot read account-level wallet endpoints. v0.2 (planned) will add OAuth device flow so balance can be queried directly from the CLI.

### Roadmap
- **v0.2** - Browser OAuth device flow (no more pasting API keys); `tokenmix balance` reads `/api/user/wallet` directly
- **v0.3** - `@tokenmix/opencode` plugin: toast in OpenCode showing balance, low-balance prompt, agent-callable `tokenmix_recharge` / `tokenmix_route_health` tools
- **v0.4** - Chinese-first UI and locale-aware prompts (matches tokenmix.ai's 6-language support)
- All planned BYOK integrations shipped: Cline (v0.4.5), Roo Code + Continue (v0.4.6), Codex (v0.4.7).
