# TokenMix CLI

Zero-config CLI to use any open-source coding agent with [TokenMix](https://tokenmix.ai) as the unified LLM backend.

One account, one balance, 160+ models routed automatically across Claude / GPT / Gemini / DeepSeek / Qwen / Moonshot / ...

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
```

## Language

The CLI speaks **English, 中文, 日本語, 한국어, Español, and Français** — the same six languages as tokenmix.ai — auto-detected from your system locale (`LANG` / `LC_ALL`). Force it explicitly with `TOKENMIX_LANG`:

```bash
TOKENMIX_LANG=zh npx tokenmix doctor   # 中文
TOKENMIX_LANG=ja npx tokenmix doctor   # 日本語
TOKENMIX_LANG=fr npx tokenmix doctor   # Français
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

MIT — see [LICENSE](./LICENSE)
