# Contributing to TokenMix CLI

Thanks for your interest in improving TokenMix CLI! This guide covers local setup, the checks we run, and how to add a new agent.

## Prerequisites

- [Node.js](https://nodejs.org) 18+ (some agents the CLI launches need a newer Node — it tells you when)
- [pnpm](https://pnpm.io) 10+

## Setup

```bash
pnpm install
pnpm dev opencode   # run the CLI from source via tsx
```

## Checks

All four must pass before a change is merged — CI runs them on every push and pull request:

```bash
pnpm typecheck     # tsc --noEmit (strict)
pnpm lint          # ESLint
pnpm format:check  # Prettier
pnpm test          # Vitest
```

Auto-fix where possible:

```bash
pnpm lint:fix
pnpm format
```

## Adding an agent

Each agent is a self-contained `AgentDescriptor` (`src/agents/<id>.ts`) implementing `installCheck` / `configure` / `launch` / `cleanup` as needed. Shared boilerplate lives in `src/agents/helpers.ts` (`probeVersion`, `npmInstallCheck`, `npmInstallGlobal`, `vscodeConfigOnlyCheck`); register the descriptor in `src/agents/registry.ts`.

User-facing strings go through the i18n catalog (`src/i18n/messages.ts`). `en` is the source of truth, and the compiler enforces that each of the other five languages defines every key — a missing translation fails the build. Add a test under `tests/`.

## Pull requests

- Keep PRs focused and include a clear description.
- Make sure `typecheck`, `lint`, `format:check`, and `test` are green.
- Update `CHANGELOG.md` when you change user-facing behavior.

## License

By contributing, you agree your contributions are licensed under the [MIT License](./LICENSE).
