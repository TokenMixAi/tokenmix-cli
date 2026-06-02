import fs from 'fs-extra'

// Atomically write a file: write to a temp file alongside the target, then rename
// it over the target. Rename is atomic on the same filesystem, so a crash or a
// concurrent writer can never observe a half-written / 0-byte target - which is how
// a plain `fs.writeFile` (open with O_TRUNC) would otherwise corrupt user config
// (e.g. truncating ~/.claude/settings.json or our own config.json to 0 bytes).
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
