import type { ReactNode } from 'react'

export function SectionHead({
  index,
  title,
  meta,
  id,
}: {
  index: string
  title: ReactNode
  meta?: ReactNode
  id?: string
}) {
  return (
    <div className="sec-head">
      <span className="sec-head__index">[ {index} ]</span>
      <h2 className="sec-head__title" id={id}>
        {title}
      </h2>
      {meta ? <div className="sec-head__meta">{meta}</div> : <span />}
    </div>
  )
}
