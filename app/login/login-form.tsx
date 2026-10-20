'use client'

import { useActionState } from 'react'
import { loginAction } from '@/lib/actions/admin'

export function LoginForm({ showHint }: { showHint: boolean }) {
  const [state, action, pending] = useActionState(loginAction, null)

  return (
    <form action={action} className="admin-login__form">
      <div>
        <span className="label label--accent">Служебный вход</span>
        <h1 style={{ marginTop: 10 }}>Админка</h1>
        <p style={{ marginTop: 10 }}>
          Управление оборудованием, заявками и текстами. Доступ — по учётной записи, выданной администратором.
        </p>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="email">
          Почта
        </label>
        <input id="email" name="email" type="email" className="input" autoComplete="username" required autoFocus />
      </div>

      <div className="field">
        <label className="field__label" htmlFor="password">
          Пароль
        </label>
        <input id="password" name="password" type="password" className="input" autoComplete="current-password" required />
      </div>

      {state?.error && (
        <div className="form-status form-status--error" role="alert">
          {state.error}
        </div>
      )}

      <button type="submit" className="btn btn--primary btn--block" disabled={pending}>
        {pending ? 'Проверяем…' : 'Войти'}
        {!pending && <span className="btn__arrow" aria-hidden="true" />}
      </button>

      {showHint && (
        <div className="login-hint">
          Демо-доступы (dev):
          <br />
          admin@vip-service23.ru / VipService2026!
          <br />
          editor@vip-service23.ru / Redaktor2026!
        </div>
      )}
    </form>
  )
}
