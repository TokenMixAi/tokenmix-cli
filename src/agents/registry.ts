import { AgentDescriptor } from './types.js'
import { OpenCodeAgent } from './opencode.js'
import { ClaudeCodeAgent } from './claude.js'
import { AiderAgent } from './aider.js'
import { KiloAgent } from './kilo.js'
import { ClineAgent } from './cline.js'
import { RooAgent } from './roo.js'
import { ContinueAgent } from './continue.js'
import { CodexAgent } from './codex.js'
import { QwenAgent } from './qwen.js'

// Ordered by historical ARPU on tokenmix (highest first). New agents go to the bottom.
export const AGENTS: readonly AgentDescriptor[] = [
  OpenCodeAgent,
  ClaudeCodeAgent,
  AiderAgent,
  KiloAgent,
  ClineAgent,
  RooAgent,
  ContinueAgent,
  CodexAgent,
  QwenAgent,
]

export function findAgent(id: string): AgentDescriptor | undefined {
  return AGENTS.find((a) => a.id === id)
}
