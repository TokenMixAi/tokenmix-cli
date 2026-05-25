import { Command } from 'commander'

export interface AgentInstallStatus {
  installed: boolean
  version?: string
  // Hint to show the user when not installed or partially installable.
  hint?: string
}

export interface AgentConfigureResult {
  // Path of the agent config file we wrote, if any (shown to the user).
  configPath?: string
  // Env vars that the agent will read at launch (passed via execa env).
  envVars?: Record<string, string>
  // Free-form notes to print after configuration (e.g. for manual-config agents).
  notes?: string[]
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

  installCheck(): Promise<AgentInstallStatus>
  install?(): Promise<void>
  configure(
    apiKey: string,
    baseUrl: string,
    defaultModel: string,
  ): Promise<AgentConfigureResult>
  launch?(args: string[], env: Record<string, string>): Promise<void>

  // Optional override for command registration. Most agents use the default in agent-runner.ts.
  registerCommand?(program: Command): void
}
