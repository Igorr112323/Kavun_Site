import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { AdminHead, Flash } from '@/components/admin-ui'
import { savePage } from '@/lib/actions/admin'
import { getPage } from '@/lib/data'
import { PAGE_MAP } from '@/lib/site-content'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function EditPageTexts({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ saved?: string; error?: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const { slug } = await params
  const { saved, error } = await searchParams
  const def = PAGE_MAP[slug]
  if (!def) notFound()
  const page = getPage(slug)
  const blocks = page.blocks

  return (
    <>
      <AdminHead
        title={`Тексты: ${def.title}`}
        subtitle={def.fields.length + ' полей. Меняются сразу после сохранения — смотрите страницу в новой вкладке.'}
        actions={
          <>
            <a href={slug === 'home' ? '/' : `/${slug}`} target="_blank" rel="noopener noreferrer" className="btn btn--ghost btn--sm">
              Открыть страницу ↗
            </a>
            <Link href="/admin/pages" className="admin-link">
              К списку
            </Link>
          </>
        }
      />
      <Flash saved={saved} error={error} />

      <form action={savePage} className="admin-form">
        <input type="hidden" name="slug" value={slug} />

        <section className="admin-form__section">
          <h2>Заголовок в админке и SEO</h2>
          <div className="field">
            <label className="field__label" htmlFor="title">
              Название страницы
            </label>
            <input id="title" name="title" className="input" defaultValue={page.title} />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="seo_title">
              SEO title
            </label>
            <input id="seo_title" name="seo_title" className="input" defaultValue={page.seo_title ?? ''} />
            <span className="field__hint">До 60–65 символов. Без «купить дешево» — это не работает.</span>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="seo_description">
              SEO description
            </label>
            <textarea id="seo_description" name="seo_description" className="textarea" rows={2} defaultValue={page.seo_description ?? ''} />
            <span className="field__hint">До 155 символов, с конкретикой: город, бренды, сроки.</span>
          </div>
        </section>

        <section className="admin-form__section">
          <h2>Тексты на странице</h2>
          {def.fields.map((field) => (
            <div className="field" key={field.key}>
              <label className="field__label" htmlFor={`block_${field.key}`}>
                {field.label}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  id={`block_${field.key}`}
                  name={`block_${field.key}`}
                  className="textarea"
                  rows={field.rows ?? 3}
                  defaultValue={blocks[field.key] ?? ''}
                />
              ) : (
                <input
                  id={`block_${field.key}`}
                  name={`block_${field.key}`}
                  className="input"
                  defaultValue={blocks[field.key] ?? ''}
                />
              )}
              {field.hint && <span className="field__hint">{field.hint}</span>}
            </div>
          ))}
        </section>

        <div className="admin-form__foot">
          <button type="submit" className="btn btn--primary">
            Сохранить тексты
            <span className="btn__arrow" aria-hidden="true" />
          </button>
          <Link href="/admin/pages" className="btn btn--ghost">
            Отмена
          </Link>
        </div>
      </form>
    </>
  )
}
