import Image from 'next/image'
import { cn } from '@/lib/utils'

type PhotoProps = {
  src: string
  alt: string
  ratio?: string
  className?: string
  imgClassName?: string
  priority?: boolean
  sizes?: string
  caption?: string
}

export function Photo({
  src,
  alt,
  ratio = '4 / 3',
  className,
  imgClassName,
  priority = false,
  sizes = '(max-width: 760px) 100vw, (max-width: 1080px) 50vw, 33vw',
  caption,
}: PhotoProps) {
  return (
    <figure className={cn('photo', className)} style={{ margin: 0 }}>
      <div className={cn('photo__frame', imgClassName)} style={{ position: 'relative', aspectRatio: ratio, overflow: 'hidden', background: 'var(--ink-3)' }}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} style={{ objectFit: 'cover' }} />
      </div>
      {caption && (
        <figcaption className="label" style={{ marginTop: 10 }}>
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
