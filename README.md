# TokenMix CLI

Zero-config CLI to use any open-source coding agent with [TokenMix](https://tokenmix.ai) as the unified LLM backend.

One account, one balance, 75+ models routed automatically across Claude / GPT / Gemini / DeepSeek / Qwen / Moonshot / ...

## Quick Start

```bash
# 1. Get an API key at https://tokenmix.ai/dashboard/keys
npx tokenmix login

# 2. Launch an agent
npx tokenmix opencode          # install + configure + start OpenCode
npx tokenmix claude            # install + configure + start Claude Code
npx tokenmix aider             # configure + start Aider (Python required)
npx tokenmix kilo              # print Kilo Code VSCode configuration
```

## Supported Agents

| Agent | Install | CLI Action |
|---|---|---|
| [OpenCode](https://github.com/sst/opencode) | `npm i -g opencode-ai` | full auto |
| [Claude Code](https://github.com/anthropics/claude-code) | `npm i -g @anthropic-ai/claude-code` | full auto |
| [Aider](https://github.com/Aider-AI/aider) | `pip install aider-chat` | semi auto |
| [Kilo Code](https://github.com/Kilo-Org/kilocode) | VSCode extension | config-only |

## Commands

```
tokenmix login [--key sk-tm-xxx]   Log in
tokenmix logout                     Remove credentials
tokenmix balance                    Open dashboard to view balance
tokenmix topup                      Open browser to top up
tokenmix models [--type chat]       List available models with prices
tokenmix list                       List supported agents
tokenmix doctor                     Diagnose configuration

tokenmix opencode [args...]         Launch OpenCode via TokenMix
tokenmix claude [args...]           Launch Claude Code via TokenMix
tokenmix aider [args...]            Launch Aider via TokenMix
tokenmix kilo                       Print Kilo Code configuration
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
