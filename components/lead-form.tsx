'use client'

import { useActionState, useEffect, useState } from 'react'
import { submitLead, type LeadState } from '@/lib/actions/public'
import { useSiteSettings } from './site-settings'
import { CheckIcon } from './icons'

const initial: LeadState = { status: 'idle' }

type LeadFormProps = {
  equipmentId?: number
  equipmentTitle?: string
  source: string
  title?: string
  subtitle?: string
  cta?: string
  compact?: boolean
  variant?: 'panel' | 'plain'
}

export function LeadForm({
  equipmentId,
  equipmentTitle,
  source,
  title = 'Заявка',
  subtitle = 'Ответим в рабочее время',
  cta = 'Отправить заявку',
  compact = false,
  variant = 'panel',
}: LeadFormProps) {
  const [state, action, pending] = useActionState(submitLead, initial)
  const [ts, setTs] = useState('')
  const { phoneDisplay, phoneHref } = useSiteSettings()

  useEffect(() => {
    setTs(String(Date.now()))
  }, [])

  if (state.status === 'ok') {
    return (
      <div className={variant === 'panel' ? 'form-panel' : ''} id="zayavka">
        <div className="form-success" role="status" aria-live="polite">
          <span className="form-success__icon">
            <CheckIcon size={20} />
          </span>
          <h3>Заявка у нас</h3>
          <p>{state.message}</p>
          <p>
            Если вопрос срочный — звоните{' '}
            <a href={`tel:${phoneHref}`} style={{ borderBottom: '1px solid currentColor' }}>
              {phoneDisplay}
            </a>
            . Скажите, что заявка с сайта{equipmentTitle ? ` по ${equipmentTitle}` : ''} — поднимем её первой.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={variant === 'panel' ? 'form-panel' : ''} id="zayavka">
      <div className="form-panel__head">
        <h3>{title}</h3>
        <span>{subtitle}</span>
      </div>

      <form action={action} noValidate aria-busy={pending}>
        <div className={compact ? 'form-grid form-grid--full' : 'form-grid'}>
          <div className="field">
            <label className="field__label" htmlFor={`name-${source}`}>
              Как вас зовут <span className="req">*</span>
            </label>
            <input
              className="input"
              id={`name-${source}`}
              name="name"
              autoComplete="name"
              placeholder="Сергей"
              aria-invalid={state.errors?.name ? 'true' : undefined}
              aria-describedby={state.errors?.name ? `name-err-${source}` : undefined}
              required
            />
            {state.errors?.name && (
              <span className="field__error" id={`name-err-${source}`}>
                {state.errors.name}
              </span>
            )}
          </div>

          <div className="field">
            <label className="field__label" htmlFor={`phone-${source}`}>
              Телефон <span className="req">*</span>
            </label>
            <input
              className="input"
              id={`phone-${source}`}
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+7 (___) ___-__-__"
              aria-invalid={state.errors?.phone ? 'true' : undefined}
              aria-describedby={state.errors?.phone ? `phone-err-${source}` : undefined}
              required
            />
            {state.errors?.phone && (
              <span className="field__error" id={`phone-err-${source}`}>
                {state.errors.phone}
              </span>
            )}
          </div>

          {!compact && (
            <div className="field span-2">
              <label className="field__label" htmlFor={`message-${source}`}>
                Что нужно — модель, профиль, ошибка на экране
              </label>
              <textarea
                className="textarea"
                id={`message-${source}`}
                name="message"
                rows={3}
                placeholder="Например: elumatec SBZ 140, после переезда ушла геометрия по оси X"
              />
            </div>
          )}

          <div className="field span-2">
            <input type="hidden" name="ts" value={ts} />
            <input type="hidden" name="source_page" value={source} />
            {equipmentId ? <input type="hidden" name="equipment_id" value={equipmentId} /> : null}
            <div className="hp" aria-hidden="true">
              <label htmlFor={`company-${source}`}>Компания</label>
              <input id={`company-${source}`} name="company" tabIndex={-1} autoComplete="off" />
            </div>

            <label className="check">
              <input type="checkbox" name="consent" required aria-invalid={state.errors?.consent ? 'true' : undefined} />
              <span>
                Согласен на обработку персональных данных. Используем номер только чтобы ответить по этой заявке —{' '}
                <a href="/privacy" target="_blank">политика</a>.
              </span>
            </label>
            {state.errors?.consent && <span className="field__error">{state.errors.consent}</span>}
          </div>
        </div>

        <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <button type="submit" className="btn btn--primary btn--block" disabled={pending} aria-live="polite">
            {pending ? 'Отправляем…' : cta}
            {!pending && <span className="btn__arrow" aria-hidden="true" />}
          </button>
          {state.status === 'error' && (
            <div className="form-status form-status--error" role="alert">
              {state.message}
            </div>
          )}
          <p className="form-note">
            Нажимая кнопку, вы не подписываетесь на рассылку. Пишем только по делу и только по этой заявке.
          </p>
        </div>
      </form>
    </div>
  )
}
