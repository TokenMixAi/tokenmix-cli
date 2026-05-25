import os from 'os'
import path from 'path'

// Per-platform config directory for tokenmix CLI itself.
// Distinct from per-agent config (e.g. ~/.config/opencode/opencode.json).
export function configDir(): string {
  if (process.platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support', 'tokenmix')
  }
  if (process.platform === 'win32') {
    return path.join(process.env.APPDATA || os.homedir(), 'tokenmix')
  }
  return path.join(process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config'), 'tokenmix')
}

export function configFile(): string {
  return path.join(configDir(), 'config.json')
}
