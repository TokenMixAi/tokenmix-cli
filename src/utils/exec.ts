import { execa } from 'execa'
import which from 'which'

export async function commandExists(cmd: string): Promise<string | null> {
  try {
    return await which(cmd)
  } catch {
    return null
  }
}

export interface RunOptions {
  stdio?: 'inherit' | 'pipe'
  env?: NodeJS.ProcessEnv
  cwd?: string
}

export async function run(cmd: string, args: string[], opts: RunOptions = {}): Promise<void> {
  await execa(cmd, args, {
    stdio: opts.stdio ?? 'inherit',
    env: { ...process.env, ...(opts.env ?? {}) },
    cwd: opts.cwd,
  })
}

export async function captureRun(cmd: string, args: string[]): Promise<{ stdout: string; stderr: string }> {
  const r = await execa(cmd, args, { stdio: 'pipe' })
  return { stdout: r.stdout?.toString() ?? '', stderr: r.stderr?.toString() ?? '' }
}
