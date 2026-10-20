import Link from 'next/link'
import type { Post } from '@/lib/types'
import { savePost } from '@/lib/actions/admin'
import { CoverField } from './media'

export function PostForm({
  post,
  equipment,
}: {
  post?: Post
  equipment: { id: number; title: string }[]
}) {
  return (
    <form action={savePost} className="admin-form">
      {post?.id ? <input type="hidden" name="id" value={post.id} /> : null}

      <section className="admin-form__section">
        <h2>Новость</h2>
        <div className="field">
          <label className="field__label" htmlFor="title">
            Заголовок <span className="req">*</span>
          </label>
          <input id="title" name="title" className="input" defaultValue={post?.title} required placeholder="На склад поступил Emmegi Phantomatic T3A" />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="excerpt">
            Лид (1–2 предложения)
          </label>
          <textarea id="excerpt" name="excerpt" className="textarea" rows={2} defaultValue={post?.excerpt ?? ''} />
          <span className="field__hint">Показывается в списке новостей и в превью. Без «мы рады сообщить».</span>
        </div>
        <div className="field">
          <label className="field__label" htmlFor="body">
            Текст
          </label>
          <textarea id="body" name="body" className="textarea" rows={14} defaultValue={post?.body ?? ''} />
          <span className="field__hint">
            Абзацы — пустой строкой. Списки — с «- » в начале строки. Подзаголовки — «## Заголовок».
          </span>
        </div>
      </section>

      <section className="admin-form__section">
        <h2>Публикация</h2>
        <div className="row row--3">
          <div className="field">
            <label className="field__label" htmlFor="published_at">
              Дата
            </label>
            <input
              id="published_at"
              name="published_at"
              type="date"
              className="input"
              defaultValue={(post?.published_at ?? new Date().toISOString()).slice(0, 10)}
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="equipment_id">
              Привязать к карточке
            </label>
            <select id="equipment_id" name="equipment_id" className="select" defaultValue={post?.equipment_id ?? ''}>
              <option value="">— без привязки —</option>
              {equipment.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="slug">
              Адрес
            </label>
            <input id="slug" name="slug" className="input" defaultValue={post?.slug} placeholder="generated-from-title" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
          <label className="admin-checkline">
            <input type="checkbox" name="is_published" defaultChecked={post ? Boolean(post.is_published) : true} />
            Опубликовано
          </label>
          <label className="admin-checkline">
            <input type="checkbox" name="is_pinned" defaultChecked={post ? Boolean(post.is_pinned) : false} />
            Закрепить сверху
          </label>
        </div>
        <CoverField initial={post?.cover} />
      </section>

      <div className="admin-form__foot">
        <button type="submit" className="btn btn--primary">
          {post?.id ? 'Сохранить' : 'Создать новость'}
          <span className="btn__arrow" aria-hidden="true" />
        </button>
        <Link href="/admin/posts" className="btn btn--ghost">
          Отмена
        </Link>
      </div>
    </form>
  )
}
