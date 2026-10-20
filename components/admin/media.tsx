'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import { CloseIcon, DownloadIcon, PlusIcon } from '@/components/icons'

async function upload(file: File): Promise<{ url: string } | { error: string }> {
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
  const json = await res.json()
  if (!res.ok) return { error: json.error ?? 'Ошибка загрузки' }
  return { url: json.url }
}

export function ImageManager({ name = 'images', initial }: { name?: string; initial: string[] }) {
  const [images, setImages] = useState<string[]>(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [drag, setDrag] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const add = (urls: string[]) => setImages((prev) => [...prev, ...urls].slice(0, 8))

  const handleFiles = async (files: FileList | File[]) => {
    setError('')
    setBusy(true)
    const list = Array.from(files).filter((f) => f.type.startsWith('image/')).slice(0, 8)
    for (const file of list) {
      const result = await upload(file)
      if ('error' in result) setError(result.error)
      else add([result.url])
    }
    setBusy(false)
  }

  const move = (index: number, dir: -1 | 1) => {
    setImages((prev) => {
      const next = [...prev]
      const target = index + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  return (
    <div className="images">
      <input type="hidden" name={name} value={JSON.stringify(images)} />
      <div
        className="images__drop"
        data-drag={drag}
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDrag(true)
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDrag(false)
          if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files)
        }}
      >
        <b>{busy ? 'Загружаем…' : 'Перетащите фото сюда или нажмите'}</b>
        <span>JPG, PNG, WebP · до 12 МБ · первое фото станет обложкой</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {images.length > 0 && (
        <div className="images__grid">
          {images.map((src, i) => (
            <div className="image-tile" key={`${src}-${i}`} data-cover={i === 0}>
              <div className="image-tile__img">
                <Image src={src} alt="" width={240} height={180} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              {i === 0 && <span className="image-tile__cover">Обложка</span>}
              <div className="image-tile__bar">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Сдвинуть влево">
                  ←
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} aria-label="Сдвинуть вправо">
                  →
                </button>
                <button type="button" onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))} aria-label="Удалить фото">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          className="input"
          placeholder="или вставьте путь: /images/prod-machining-centre.jpg"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              const value = (e.target as HTMLInputElement).value.trim()
              if (value) {
                add([value])
                ;(e.target as HTMLInputElement).value = ''
              }
            }
          }}
        />
        <span className="label" style={{ alignSelf: 'center', whiteSpace: 'nowrap' }}>
          Enter — добавить
        </span>
      </div>

      {error && <span className="field__error">{error}</span>}
      <span className="field__hint">Порядок фото = порядок в галерее. Обложка идёт в карточку и Open Graph.</span>
    </div>
  )
}

export function FileField({
  name,
  initial,
  label,
  accept = 'application/pdf',
  hint,
  folder = 'документ',
}: {
  name: string
  initial?: string | null
  label: string
  accept?: string
  hint?: string
  folder?: string
}) {
  const [value, setValue] = useState(initial ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handle = async (file: File) => {
    setBusy(true)
    setError('')
    const result = await upload(file)
    if ('error' in result) setError(result.error)
    else setValue(result.url)
    setBusy(false)
  }

  return (
    <div className="field">
      <span className="field__label">{label}</span>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          className="input"
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={`/uploads/… или путь к ${folder}`}
        />
        <button type="button" className="icon-btn" aria-label={`Загрузить ${folder}`} onClick={() => inputRef.current?.click()}>
          {busy ? '…' : <PlusIcon size={14} />}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handle(file)
            e.target.value = ''
          }}
        />
      </div>
      {value && (
        <a href={value} target="_blank" rel="noopener noreferrer" className="admin-link" style={{ justifySelf: 'start' }}>
          <DownloadIcon size={11} /> Открыть файл
        </a>
      )}
      {hint && <span className="field__hint">{hint}</span>}
      {error && <span className="field__error">{error}</span>}
    </div>
  )
}

export function CoverField({ initial }: { initial?: string | null }) {
  const [value, setValue] = useState(initial ?? '')
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handle = async (file: File) => {
    setBusy(true)
    const result = await upload(file)
    if ('url' in result) setValue(result.url)
    setBusy(false)
  }

  return (
    <div className="field">
      <span className="field__label">Обложка</span>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        {value ? (
          <div style={{ width: 120, border: '1px solid var(--line)', overflow: 'hidden', position: 'relative', aspectRatio: '4/3' }}>
            <Image src={value} alt="" fill sizes="120px" style={{ objectFit: 'cover' }} />
            <button
              type="button"
              onClick={() => setValue('')}
              aria-label="Убрать обложку"
              style={{ position: 'absolute', top: 3, right: 3, background: 'rgba(16,19,16,.8)', color: '#fff', padding: 3 }}
            >
              <CloseIcon size={10} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="images__drop"
            style={{ width: 160, padding: 12 }}
            onClick={() => inputRef.current?.click()}
          >
            <b style={{ fontSize: 11 }}>{busy ? '…' : 'Загрузить'}</b>
            <span style={{ fontSize: 9 }}>4:3</span>
          </button>
        )}
        <input type="hidden" name="cover" value={value} />
        <div style={{ display: 'grid', gap: 6, flex: 1 }}>
          <input className="input" value={value} onChange={(e) => setValue(e.target.value)} placeholder="или путь к файлу" />
          <button type="button" className="admin-link" onClick={() => inputRef.current?.click()} style={{ justifySelf: 'start' }}>
            Заменить файл
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handle(file)
            e.target.value = ''
          }}
        />
      </div>
    </div>
  )
}
