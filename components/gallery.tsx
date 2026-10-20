'use client'

import Image from 'next/image'
import { useState } from 'react'

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0)
  const list = images.length ? images : ['/images/profiles.jpg']
  return (
    <div className="gallery">
      <div className="gallery__main">
        <Image
          src={list[index]}
          alt={`${alt} — фото ${index + 1}`}
          fill
          priority
          sizes="(max-width: 1080px) 100vw, 58vw"
          style={{ objectFit: 'cover' }}
        />
        <span className="corner corner--tr" aria-hidden="true" />
        <span className="corner corner--bl" aria-hidden="true" />
      </div>
      {list.length > 1 && (
        <div className="gallery__thumbs" role="group" aria-label="Фотографии оборудования">
          {list.map((src, i) => (
            <button
              key={src + i}
              type="button"
              className="gallery__thumb"
              aria-current={i === index}
              aria-label={`Показать фото ${i + 1}`}
              onClick={() => setIndex(i)}
            >
              <Image src={src} alt="" fill sizes="120px" style={{ objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
