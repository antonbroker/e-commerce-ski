/**
 * Generates small WebP thumbnails from public/img for faster catalog loading.
 * Run from client folder: npm run resize-images
 * Output: public/img/thumbs/ (same structure, .webp, max width 480px)
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const IMG_DIR = path.join(__dirname, '..', 'public', 'img')
const THUMBS_DIR = path.join(IMG_DIR, 'thumbs')
const MAX_WIDTH = 480
const WEBP_QUALITY = 82
const EXT = /\.(png|jpe?g|webp)$/i

function getAllImagePaths(dir, base = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const e of entries) {
    const rel = base ? `${base}/${e.name}` : e.name
    const full = path.join(dir, e.name)
    if (e.isDirectory() && e.name !== 'thumbs') {
      files.push(...getAllImagePaths(full, rel))
    } else if (EXT.test(e.name)) {
      files.push({ rel, full })
    }
  }
  return files
}

async function run() {
  if (!fs.existsSync(IMG_DIR)) {
    console.error('Not found:', IMG_DIR)
    process.exit(1)
  }
  const files = getAllImagePaths(IMG_DIR)
  if (files.length === 0) {
    console.log('No images in public/img')
    return
  }
  if (!fs.existsSync(THUMBS_DIR)) {
    fs.mkdirSync(THUMBS_DIR, { recursive: true })
  }
  console.log(`Generating ${files.length} thumbnails (max width ${MAX_WIDTH}px, WebP q${WEBP_QUALITY})...`)
  let ok = 0
  let err = 0
  for (const { rel, full } of files) {
    const outRel = rel.replace(EXT, '.webp')
    const outPath = path.join(THUMBS_DIR, outRel)
    const outDir = path.dirname(outPath)
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true })
    }
    try {
      await sharp(full)
        .resize(MAX_WIDTH, null, { withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toFile(outPath)
      ok++
      console.log('  ', rel, '->', outRel)
    } catch (e) {
      err++
      console.error('  FAIL', rel, e.message)
    }
  }
  console.log(`Done. ${ok} ok, ${err} failed.`)
}

run()
