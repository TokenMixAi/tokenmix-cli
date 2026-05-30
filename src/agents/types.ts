import { Command } from 'commander'

export interface AgentInstallStatus {
  installed: boolean
  version?: string
  // Hint to show the user when not installed or partially installable.
  hint?: string
  // The exact shell command that installs this agent (e.g. `npm install -g X`),
  // when applicable. Used to give clean install guidance without parsing `hint`.
  installCmd?: string
}

export interface AgentConfigureResult {
  // Path of the agent config file we wrote, if any (shown to the user).
  configPath?: string
  // Env vars that the agent will read at launch (passed via execa env).
  envVars?: Record<string, string>
  // Free-form notes to print after configuration (e.g. for manual-config agents).
  notes?: string[]
}

export interface AgentCleanupResult {
  // Whether tokenmix-written config was actually found and reverted.
  reverted: boolean
  // Config file we touched (shown to the user).
  configPath?: string
  // Optional caveat to print after reverting.
  note?: string
}

export type AgentInstallMode =
  | 'auto-npm'        // installed via `npm install -g <pkg>`
  | 'auto-pip'        // requires Python; CLI guides install
  | 'manual-vscode'   // VSCode extension; CLI prints config only
  | 'manual'          // unknown install path; CLI prints hint

export interface AgentDescriptor {
  id: string                 // short ID used as subcommand name (e.g. 'opencode')
  displayName: string        // human-readable name
  description: string
  installMode: AgentInstallMode
  // Minimum Node major version the agent's binary needs (Codex & Qwen Code need 22).
  // runAgent refuses below this with a friendly message instead of a cryptic npm error.
  minNode?: number

  installCheck(): Promise<AgentInstallStatus>
  install?(): Promise<void>
  configure(
    apiKey: string,
    baseUrl: string,
    defaultModel: string,
  ): Promise<AgentConfigureResult>
  launch?(args: string[], env: Record<string, string>): Promise<void>

  // Undo whatever configure() wrote (used by `tokenmix logout`). Optional:
  // agents that only set launch-time env (aider, kilo) have nothing to revert.
  cleanup?(): Promise<AgentCleanupResult>

  // Optional override for command registration. Most agents use the default in agent-runner.ts.
  registerCommand?(program: Command): void
}
