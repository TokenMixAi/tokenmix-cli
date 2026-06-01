import { describe, it, expect, afterEach } from 'vitest'
import fs from 'fs-extra'
import os from 'os'
import path from 'path'
import { writeFileAtomic } from '../src/utils/fs.js'

describe('writeFileAtomic', () => {
  let dir = ''
  afterEach(async () => {
    if (dir) await fs.remove(dir)
    dir = ''
  })

  const mkdir = async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'tm-fs-'))
    return path.join(dir, 'config.json')
  }

  it('writes the full content to the target', async () => {
    const f = await mkdir()
    await writeFileAtomic(f, '{"a":1}')
    expect(await fs.readFile(f, 'utf-8')).toBe('{"a":1}')
  })

  it('overwrites an existing file with no partial state left', async () => {
    const f = await mkdir()
    await fs.writeFile(f, 'OLD-AND-LONGER-CONTENT')
    await writeFileAtomic(f, 'new')
    expect(await fs.readFile(f, 'utf-8')).toBe('new')
  })

  it('leaves no temp file behind on success', async () => {
    const f = await mkdir()
    await writeFileAtomic(f, 'x')
    expect(await fs.readdir(dir)).toEqual(['config.json'])
  })

  it('applies the requested mode (non-Windows)', async () => {
    if (process.platform === 'win32') return
    const f = await mkdir()
    await writeFileAtomic(f, 'x', 0o600)
    expect((await fs.stat(f)).mode & 0o777).toBe(0o600)
  })
})
