import fs from 'fs'
import os from 'os'
import path from 'path'
import { execFileSync } from 'child_process'

const root = process.cwd()
const logoPath = path.join(root, 'icons', 'logo.svg')
const outDir = path.join(root, 'icons')
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stockb-icons-'))

try {
  execFileSync('qlmanage', ['-t', '-s', '512', '-o', tmpDir, logoPath], {
    stdio: 'ignore',
  })

  const renderedPath = path.join(tmpDir, 'logo.svg.png')

  if (!fs.existsSync(renderedPath)) {
    throw new Error('Quick Look did not generate a PNG from icons/logo.svg')
  }

  for (const size of [16, 48, 128]) {
    const outputPath = path.join(outDir, `icon-${size}.png`)
    fs.copyFileSync(renderedPath, outputPath)
    execFileSync('sips', ['-Z', String(size), outputPath], { stdio: 'ignore' })
    console.log(`generated ${path.basename(outputPath)}`)
  }
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true })
}
