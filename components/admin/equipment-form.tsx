'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Category, EquipmentFull, Manufacturer } from '@/lib/types'
import { saveEquipment } from '@/lib/actions/admin'
import { ImageManager, FileField } from './media'
import { CloseIcon, PlusIcon } from '@/components/icons'

function SpecsEditor({ initial }: { initial: { label: string; value: string }[] }) {
  const [rows, setRows] = useState(initial.length ? initial : [{ label: '', value: '' }])

  return (
    <div className="spec-editor">
      {rows.map((row, i) => (
        <div className="spec-editor__row" key={i}>
          <input className="input" name="spec_label" defaultValue={row.label} placeholder="Параметр: Ход по оси X" aria-label="Параметр" />
          <input className="input" name="spec_value" defaultValue={row.value} placeholder="Значение: 4 320 мм" aria-label="Значение" />
          <button
            type="button"
            className="icon-btn icon-btn--danger"
            aria-label="Удалить параметр"
            onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))}
          >
            <CloseIcon size={13} />
          </button>
        </div>
      ))}
      <button
        type="button"
        className="btn btn--ghost btn--sm"
        style={{ justifySelf: 'start' }}
        onClick={() => setRows((prev) => [...prev, { label: '', value: '' }])}
      >
        <PlusIcon size={13} />
        Добавить характеристику
      </button>
      <span className="field__hint">
        Первые три параметра показываются на карточке в каталоге. Формулировки — как в паспорте, с единицами.
      </span>
    </div>
  )
}

export function EquipmentForm({
  item,
  categories,
  manufacturers,
}: {
  item?: EquipmentFull
  categories: Category[]
  manufacturers: Manufacturer[]
}) {
  return (
    <form action={saveEquipment} className="admin-form">
      {item?.id ? <input type="hidden" name="id" value={item.id} /> : null}

      <section className="admin-form__section">
        <h2>Основное</h2>
        <div className="field">
          <label className="field__label" htmlFor="title">
            Название карточки <span className="req">*</span>
          </label>
          <input id="title" name="title" className="input" defaultValue={item?.title} required placeholder="Обрабатывающий центр elumatec SBZ 140" />
          <span className="field__hint">Как показывать в каталоге. Бренд и модель — в названии или отдельно.</span>
        </div>
        <div className="row row--3">
          <div className="field">
            <label className="field__label" htmlFor="slug">
              Адрес страницы
            </label>
            <input id="slug" name="slug" className="input" defaultValue={item?.slug} placeholder="elumatec-sbz-140" />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="model">
              Модель
            </label>
            <input id="model" name="model" className="input" defaultValue={item?.model ?? ''} placeholder="SBZ 140" />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="year">
              Год выпуска
            </label>
            <input id="year" name="year" type="number" className="input" defaultValue={item?.year ?? ''} placeholder="2024" />
          </div>
        </div>
        <div className="row">
          <div className="field">
            <label className="field__label" htmlFor="manufacturer_id">
              Производитель
            </label>
            <select id="manufacturer_id" name="manufacturer_id" className="select" defaultValue={item?.manufacturer_id ?? ''}>
              <option value="">— не указан —</option>
              {manufacturers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="category_id">
              Категория
            </label>
            <select id="category_id" name="category_id" className="select" defaultValue={item?.category_id ?? ''}>
              <option value="">— не указана —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="row row--3">
          <div className="field">
            <label className="field__label" htmlFor="condition">
              Состояние
            </label>
            <select id="condition" name="condition" className="select" defaultValue={item?.condition ?? 'new'}>
              <option value="new">Новое</option>
              <option value="used">Б/У</option>
            </select>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="sort">
              Сортировка
            </label>
            <input id="sort" name="sort" type="number" className="input" defaultValue={item?.sort ?? 100} />
            <span className="field__hint">Меньше — выше в каталоге.</span>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="status">
              Наличие
            </label>
            <select id="status" name="status" className="select" defaultValue={item?.status ?? 'in_stock'}>
              <option value="in_stock">В наличии</option>
              <option value="in_transit">В пути</option>
              <option value="on_order">Под заказ</option>
              <option value="reserved">Зарезервировано</option>
              <option value="sold">Продано</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', paddingTop: 4 }}>
          <label className="admin-checkline">
            <input type="checkbox" name="is_published" defaultChecked={item ? Boolean(item.is_published) : true} />
            Опубликовано на сайте
          </label>
          <label className="admin-checkline">
            <input type="checkbox" name="is_featured" defaultChecked={item ? Boolean(item.is_featured) : false} />
            Показывать на главной
          </label>
          <label className="admin-checkline">
            <input type="checkbox" name="checked" defaultChecked={item ? Boolean(item.checked) : false} />
            Отметка «проверено, запущено»
          </label>
        </div>
      </section>

      <section className="admin-form__section">
        <h2>Цена</h2>
        <div className="row row--3">
          <div className="field">
            <label className="field__label" htmlFor="price">
              Цена, ₽
            </label>
            <input id="price" name="price" type="number" step="1000" className="input" defaultValue={item?.price ?? ''} placeholder="4350000" />
          </div>
          <div className="field" style={{ alignSelf: 'end', paddingBottom: 14 }}>
            <label className="admin-checkline">
              <input type="checkbox" name="price_on_request" defaultChecked={item ? Boolean(item.price_on_request) : false} />
              Цена по запросу
            </label>
          </div>
          <div />
        </div>
        <span className="field__hint">Если включено «по запросу», поле цены не показывается в карточке, но остаётся в базе.</span>
      </section>

      <section className="admin-form__section">
        <h2>Фотографии</h2>
        <ImageManager initial={item?.images_parsed ?? []} />
      </section>

      <section className="admin-form__section">
        <h2>Характеристики</h2>
        <SpecsEditor initial={item?.specs_parsed ?? []} />
        <div className="row row--3">
          <div className="field">
            <label className="field__label" htmlFor="power">
              Питание
            </label>
            <input id="power" name="power" className="input" defaultValue={item?.power ?? ''} placeholder="400 В, 3~, 50 Гц, 63 А" />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="weight">
              Масса
            </label>
            <input id="weight" name="weight" className="input" defaultValue={item?.weight ?? ''} placeholder="3 900 кг" />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="dimensions">
              Габариты
            </label>
            <input id="dimensions" name="dimensions" className="input" defaultValue={item?.dimensions ?? ''} placeholder="7 900 × 2 100 × 2 900 мм" />
          </div>
        </div>
      </section>

      <section className="admin-form__section">
        <h2>Тексты</h2>
        <div className="field">
          <label className="field__label" htmlFor="description">
            Описание
          </label>
          <textarea id="description" name="description" className="textarea" rows={9} defaultValue={item?.description ?? ''} />
          <span className="field__hint">Абзацы разделяйте пустой строкой. Первый абзац выводится лидом в карточке.</span>
        </div>
        <div className="field">
          <label className="field__label" htmlFor="condition_note">
            Состояние (для б/у): что проверили и сделали
          </label>
          <textarea id="condition_note" name="condition_note" className="textarea" rows={5} defaultValue={item?.condition_note ?? ''} />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="complete_set">
            Комплектация
          </label>
          <textarea id="complete_set" name="complete_set" className="textarea" rows={2} defaultValue={item?.complete_set ?? ''} />
        </div>
        <FileField
          name="passport_url"
          initial={item?.passport_url}
          label="Паспорт / протокол проверки (PDF)"
          folder="документ"
          hint="Показывается в карточке как «Паспорт и протокол проверки»."
        />
      </section>

      <div className="admin-form__foot">
        <button type="submit" className="btn btn--primary">
          {item?.id ? 'Сохранить изменения' : 'Создать карточку'}
          <span className="btn__arrow" aria-hidden="true" />
        </button>
        <Link href="/admin/equipment" className="btn btn--ghost">
          Отмена
        </Link>
        {item?.slug && (
          <a href={`/equipment/${item.slug}`} target="_blank" rel="noopener noreferrer" className="admin-link" style={{ marginLeft: 'auto' }}>
            Открыть на сайте ↗
          </a>
        )}
      </div>
    </form>
  )
}
