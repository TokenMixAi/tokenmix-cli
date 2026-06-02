# TokenMix CLI

[![CI](https://github.com/TokenMixAi/tokenmix-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/TokenMixAi/tokenmix-cli/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/tokenmix.svg)](https://www.npmjs.com/package/tokenmix)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Zero-config CLI to use any open-source coding agent with [TokenMix](https://tokenmix.ai) as the unified LLM backend.

One account, one balance, 160+ models routed automatically across Claude / GPT / Gemini / DeepSeek / Qwen / Moonshot / ...

## Why TokenMix

Behind the zero-config CLI is a gateway built to be the **honest, transparent** LLM backend for BYOK coding agents:

- **The model you pick is the model you get.** Your request routes to the real upstream model you named, with no silent downgrade to a cheaper one (the grey market's classic "sold Opus, served Haiku"). Model aliases are name normalization only, never a swap.
- **Transparent, real-time billing.** `tokenmix balance` shows your actual balance, gift credit, and total spent to micro-USD precision, not opaque "credits". `tokenmix models` lists every model's real price (free models show `$0`, not a dash).
- **Prompt caching that saves you money, automatically.** Cache hits bill at the discounted rate with nothing to configure: OpenAI / DeepSeek / Gemini / Qwen via their `cached_tokens`, Anthropic via `cache_control` pass-through (cache reads about 10% of the input price). The savings are yours, and you can see them.
- **One key, every protocol.** OpenAI Chat Completions, Anthropic Messages, and the Responses API, all on one account, which is why every agent below (terminal and editor alike) runs on a single balance.
- **Non-invasive by design.** Configuring an agent never clobbers your setup: your Claude settings are backed up and restored, Codex's provider is injected at launch (your `~/.codex/config.toml` stays untouched), and `tokenmix logout` reverts what it changed. Credentials are stored locally at `0600`.

## TokenMix vs. the grey market

The grey-market proxy scene is cheap but trust-broken: independent audits have documented model substitution, credential theft, and prompt-data resale. TokenMix is built to be the honest alternative, and every row below is enforced in code, not just promised:

| | Typical grey-market proxy | TokenMix |
|---|---|---|
| **The model you get** | Sells "Opus", serves Haiku / Qwen | The model you name is the model that runs, with no fallback to a cheaper one |
| **Billing** | Opaque "credits", no real-usage detail | Real upstream usage at the public price, to micro-USD, auditable |
| **Cache savings** | Pocketed by the proxy | Passed back to you at the discounted rate, automatically |
| **Your credentials** | Keys harvested and resold | Stored locally at `0600`, injected non-invasively, reverted on `logout` |

Versus a mainstream gateway like [OpenRouter](https://openrouter.ai), the difference is focus, not a knock on them: TokenMix is built for Asia/China BYOK users, with a six-language CLI and dashboard, networking tuned for slow or restricted connections, and one balance across the Anthropic, OpenAI, and Responses protocols.

## Quick Start

```bash
# 1. Log in (opens browser, confirm a short code)
npx tokenmix login

# 2. Launch an agent
npx tokenmix opencode          # install + configure + start OpenCode
npx tokenmix claude            # install + configure + start Claude Code
npx tokenmix aider             # configure + start Aider (Python required)
npx tokenmix kilo              # print Kilo Code VSCode configuration
npx tokenmix cline             # print Cline VSCode configuration
npx tokenmix roo               # print Roo Code VSCode configuration
npx tokenmix continue          # print Continue config.yaml snippet
npx tokenmix codex             # install + configure + start Codex
npx tokenmix qwen              # install + configure + start Qwen Code
npx tokenmix goose             # configure + start Goose (install it first)
npx tokenmix openhands         # configure + start OpenHands (install it first)
```

### Alternative login modes

```bash
npx tokenmix login --paste                     # interactive paste prompt (no browser)
npx tokenmix login --key sk-tm-...             # supply API key directly (for CI / scripts)
```

## Supported Agents

| Agent | Install | CLI Action |
|---|---|---|
| [OpenCode](https://github.com/sst/opencode) | `npm i -g opencode-ai` | full auto |
| [Claude Code](https://github.com/anthropics/claude-code) | `npm i -g @anthropic-ai/claude-code` | full auto |
| [Aider](https://github.com/Aider-AI/aider) | `pip install aider-chat` | semi auto |
| [Kilo Code](https://github.com/Kilo-Org/kilocode) | VSCode extension | config-only |
| [Cline](https://github.com/cline/cline) | VSCode extension | config-only |
| [Roo Code](https://github.com/RooCodeInc/Roo-Code) | VSCode extension | config-only |
| [Continue](https://github.com/continuedev/continue) | VSCode / JetBrains | config-only |
| [Codex](https://github.com/openai/codex) | `npm i -g @openai/codex` | full auto |
| [Qwen Code](https://github.com/QwenLM/qwen-code) | `npm i -g @qwen-code/qwen-code` | full auto |
| [Goose](https://github.com/block/goose) | [install script](https://block.github.io/goose) | semi auto |
| [OpenHands](https://github.com/All-Hands-AI/OpenHands) | `uv tool install openhands` (Python 3.12+) | semi auto |

## Commands

```
tokenmix login [--key sk-tm-xxx]   Log in
tokenmix logout                     Remove credentials (and revert injected agent config)
tokenmix balance                    Show your live balance (or open the dashboard)
tokenmix topup                      Open browser to top up
tokenmix models [--type chat]       List available models with prices
tokenmix list                       List supported agents
tokenmix doctor                     Diagnose configuration

tokenmix opencode [args...]         Launch OpenCode via TokenMix
tokenmix claude [args...]           Launch Claude Code via TokenMix
tokenmix aider [args...]            Launch Aider via TokenMix
tokenmix kilo                       Print Kilo Code configuration
tokenmix cline                      Print Cline configuration
tokenmix roo                        Print Roo Code configuration
tokenmix continue                   Print Continue config.yaml snippet
tokenmix codex [args...]            Launch Codex via TokenMix
tokenmix qwen [args...]             Launch Qwen Code via TokenMix
tokenmix goose [args...]            Launch Goose via TokenMix
tokenmix openhands [args...]        Launch OpenHands via TokenMix
```

## Language

The CLI speaks **English, 中文, 日本語, 한국어, Español, and Français** (the same six languages as tokenmix.ai), auto-detected from your system locale (`LANG` / `LC_ALL`). Force it explicitly with `TOKENMIX_LANG`:

```bash
TOKENMIX_LANG=zh npx tokenmix doctor   # 中文
TOKENMIX_LANG=ja npx tokenmix doctor   # 日本語
TOKENMIX_LANG=fr npx tokenmix doctor   # Français
```

## Default model

Agents default to `claude-sonnet-4.6`. Override it for any launch with the `TOKENMIX_DEFAULT_MODEL` environment variable, handy for a cheaper/faster default or for scripting:

```bash
TOKENMIX_DEFAULT_MODEL=claude-haiku-4.5 npx tokenmix opencode
TOKENMIX_DEFAULT_MODEL=qwen-flash       npx tokenmix aider
```

(`tokenmix claude` and `tokenmix codex` speak the Anthropic / Responses protocols, so they need a Claude-family model; the other agents accept any chat model.)

## Slow or restricted networks

Requests auto-retry transient network failures (so a single hiccup won't fail a command) and time out after 20s. On a slow, proxied, or firewalled connection, raise the timeout with `TOKENMIX_TIMEOUT_MS`:

```bash
TOKENMIX_TIMEOUT_MS=60000 npx tokenmix login
```

If the default gateway host is unreachable from your network, point the CLI at a self-hosted or backup endpoint with `TOKENMIX_API_BASE`. It overrides the stored config at runtime only and is never written to disk, so it stays safe for one-off use, containers, and CI:

```bash
TOKENMIX_API_BASE=https://your-gateway.example.com npx tokenmix doctor
```

Behind a package-registry mirror (for example in mainland China), install through your mirror so the CLI and its agents download quickly:

```bash
npm config set registry https://registry.npmmirror.com
npm install -g tokenmix
```

## Configuration Location

Your TokenMix credentials are stored locally at:

- macOS: `~/Library/Application Support/tokenmix/config.json`
- Linux: `~/.config/tokenmix/config.json` (respects `XDG_CONFIG_HOME`)
- Windows: `%APPDATA%/tokenmix/config.json`

File permissions are restricted to `0600` (owner read/write only).

## Development

```bash
pnpm install
pnpm dev opencode
```

## License

MIT. See [LICENSE](./LICENSE).
