import fs from 'fs-extra'

// Write to a temp file alongside the target, then rename over it. Rename is atomic
// on the same filesystem, so a crash or concurrent writer can't leave a half-written
// or 0-byte target - which is exactly how a plain fs.writeFile (O_TRUNC) can wipe
// config like ~/.claude/settings.json or our own config.json.
export async function writeFileAtomic(
  filePath: string,
  data: string,
  mode?: number,
): Promise<void> {
  const tmp = `${filePath}.${process.pid}.tmp`
  try {
    await fs.writeFile(tmp, data)
    if (mode !== undefined) {
      try {
        await fs.chmod(tmp, mode)
      } catch {
        // chmod unsupported (e.g. Windows) - non-fatal, keep going.
      }
    }
    await fs.rename(tmp, filePath)
  } catch (err) {
    // Best-effort cleanup of the temp file if the rename never happened.
    try {
      await fs.remove(tmp)
    } catch {
      // ignore
    }
    throw err
  }
}
