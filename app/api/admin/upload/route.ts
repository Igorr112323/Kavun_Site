import { NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { getCurrentUser } from '@/lib/auth'

const MAX_SIZE = 12 * 1024 * 1024

/**
 * Проверяем не только MIME из браузера (его легко подделать), но и
 * сигнатуру файла. Так через загрузку нельзя положить в public/uploads
 * html или скрипт под видом картинки.
 */
function detectType(buf: Buffer): { type: string; ext: string } | null {
  if (buf.length < 12) return null
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { type: 'image/jpeg', ext: 'jpg' }
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { type: 'image/png', ext: 'png' }
  }
  if (buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') {
    return { type: 'image/webp', ext: 'webp' }
  }
  if (buf.subarray(4, 12).toString('ascii').startsWith('ftypavi')) return { type: 'image/avif', ext: 'avif' }
  if (buf.subarray(0, 5).toString('ascii') === '%PDF-') return { type: 'application/pdf', ext: 'pdf' }
  return null
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Требуется вход' }, { status: 401 })

  const form = await request.formData()
  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Файл не получен' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Файл больше 12 МБ' }, { status: 413 })
  }
  if (file.size === 0) {
    return NextResponse.json({ error: 'Файл пустой' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const detected = detectType(buffer)
  if (!detected) {
    return NextResponse.json({ error: 'Разрешены JPG, PNG, WebP, AVIF и PDF' }, { status: 415 })
  }

  const name = `${Date.now().toString(36)}-${randomBytes(4).toString('hex')}.${detected.ext}`
  const dir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, name), buffer)

  return NextResponse.json({ url: `/uploads/${name}`, type: detected.type, size: file.size })
}
