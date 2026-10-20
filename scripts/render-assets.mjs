import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'

const SRC = '/tmp/asset-svg'
const DEST = path.join(process.cwd(), 'public', 'images')

if (!fs.existsSync(SRC)) {
  console.error('Нет каталога', SRC, '— сначала выполните python3 scripts/gen-assets.py')
  process.exit(1)
}

const files = fs.readdirSync(SRC).filter((f) => f.endsWith('.svg'))
for (const file of files) {
  const out = path.join(DEST, file.replace(/\.svg$/, '.jpg'))
  await sharp(path.join(SRC, file), { density: 144 })
    .jpeg({ quality: 84, chromaSubsampling: '4:4:4', mozjpeg: true })
    .toFile(out)
  const { size } = fs.statSync(out)
  console.log('rendered', path.basename(out), Math.round(size / 1024) + ' КБ')
}
