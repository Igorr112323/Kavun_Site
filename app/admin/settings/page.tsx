import { redirect } from 'next/navigation'
import { AdminHead, Flash } from '@/components/admin-ui'
import { Logo } from '@/components/logo'
import { saveSettings } from '@/lib/actions/admin'
import { getCurrentUser } from '@/lib/auth'
import { getSettings, getStats } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>
}) {
  const me = await getCurrentUser()
  if (!me) redirect('/login')
  if (me.role !== 'admin') redirect('/admin')
  const { saved, error } = await searchParams
  const s = getSettings()
  const stats = getStats()

  return (
    <>
      <AdminHead
        title="Настройки сайта"
        subtitle="Контакты, бренд и цифры на главной. Эти данные подставляются в шапку, подвал, карточки и микроразметку."
      />
      <Flash saved={saved} error={error} />

      <form action={saveSettings} className="admin-form">
        <section className="admin-form__section">
          <h2>Контакты</h2>
          <div className="row">
            <div className="field">
              <label className="field__label" htmlFor="phone_display">
                Телефон на сайте
              </label>
              <input id="phone_display" name="phone_display" className="input" defaultValue={s.phone_display} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="phone_href">
                Телефон для ссылки tel:
              </label>
              <input id="phone_href" name="phone_href" className="input" defaultValue={s.phone_href} />
              <span className="field__hint">Только цифры и плюс, без пробелов и скобок.</span>
            </div>
          </div>
          <div className="row">
            <div className="field">
              <label className="field__label" htmlFor="email">
                Почта
              </label>
              <input id="email" name="email" type="email" className="input" defaultValue={s.email} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="work_hours">
                Часы работы
              </label>
              <input id="work_hours" name="work_hours" className="input" defaultValue={s.work_hours} />
            </div>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="address">
              Полный адрес
            </label>
            <input id="address" name="address" className="input" defaultValue={s.address} />
          </div>
          <div className="row">
            <div className="field">
              <label className="field__label" htmlFor="address_short">
                Короткий адрес (шапка)
              </label>
              <input id="address_short" name="address_short" className="input" defaultValue={s.address_short} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="company_since">
                Работаем с года
              </label>
              <input id="company_since" name="company_since" className="input" defaultValue={s.company_since} />
            </div>
          </div>
          <div className="row">
            <div className="field">
              <label className="field__label" htmlFor="telegram">
                Telegram
              </label>
              <input id="telegram" name="telegram" className="input" defaultValue={s.telegram} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="whatsapp">
                WhatsApp
              </label>
              <input id="whatsapp" name="whatsapp" className="input" defaultValue={s.whatsapp} />
            </div>
          </div>
          <div className="row">
            <div className="field">
              <label className="field__label" htmlFor="map_lat">
                Широта
              </label>
              <input id="map_lat" name="map_lat" className="input" defaultValue={s.map_lat} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="map_lon">
                Долгота
              </label>
              <input id="map_lon" name="map_lon" className="input" defaultValue={s.map_lon} />
            </div>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="legal_note">
              Юридическая строка в подвале
            </label>
            <textarea id="legal_note" name="legal_note" className="textarea" rows={2} defaultValue={s.legal_note} />
          </div>
        </section>

        <section className="admin-form__section">
          <h2>Логотип</h2>
          <div className="logo-choice">
            <label>
              <input type="radio" name="logo_variant" value="profile" defaultChecked={s.logo_variant !== 'groove'} />
              <div className="logo-dark-preview">
                <Logo variant="profile" compact />
              </div>
              <b>Вариант A · «Профиль»</b>
              <span className="label">Сечение профиля с пазом и срезом под 45°</span>
            </label>
            <label>
              <input type="radio" name="logo_variant" value="groove" defaultChecked={s.logo_variant === 'groove'} />
              <div className="logo-dark-preview">
                <Logo variant="groove" compact />
              </div>
              <b>Вариант B · «Канавка»</b>
              <span className="label">V-паз в теле профиля, точка — фреза</span>
            </label>
          </div>
          <span className="field__hint">
            Знак работает в монохроме и в акцентном оранжевом. В шапке — светлый на графите, в документах — чёрный на
            белом.
          </span>
        </section>

        <section className="admin-form__section">
          <h2>Цифры на главной</h2>
          <div className="row">
            {[0, 1].map((i) => (
              <div key={i} style={{ display: 'grid', gap: 10 }}>
                <div className="row">
                  <div className="field">
                    <label className="field__label">Значение {i + 1}</label>
                    <input name={`stat_value_${i}`} type="number" className="input" defaultValue={stats[i]?.value ?? 0} />
                  </div>
                  <div className="field">
                    <label className="field__label">Суффикс</label>
                    <input name={`stat_suffix_${i}`} className="input" defaultValue={stats[i]?.suffix ?? ''} placeholder="+ или ч" />
                  </div>
                </div>
                <div className="field">
                  <label className="field__label">Подпись {i + 1}</label>
                  <input name={`stat_label_${i}`} className="input" defaultValue={stats[i]?.label ?? ''} />
                </div>
              </div>
            ))}
          </div>
          <div className="row">
            {[2, 3].map((i) => (
              <div key={i} style={{ display: 'grid', gap: 10 }}>
                <div className="row">
                  <div className="field">
                    <label className="field__label">Значение {i + 1}</label>
                    <input name={`stat_value_${i}`} type="number" className="input" defaultValue={stats[i]?.value ?? 0} />
                  </div>
                  <div className="field">
                    <label className="field__label">Суффикс</label>
                    <input name={`stat_suffix_${i}`} className="input" defaultValue={stats[i]?.suffix ?? ''} placeholder="+ или ч" />
                  </div>
                </div>
                <div className="field">
                  <label className="field__label">Подпись {i + 1}</label>
                  <input name={`stat_label_${i}`} className="input" defaultValue={stats[i]?.label ?? ''} />
                </div>
              </div>
            ))}
          </div>
          <span className="field__hint">
            Цифры анимируются при появлении. Не ставьте «10 000 клиентов» — цифра должна быть объяснимой.
          </span>
        </section>

        <section className="admin-form__section">
          <h2>Бренд</h2>
          <div className="row">
            <div className="field">
              <label className="field__label" htmlFor="site_name">
                Название сайта
              </label>
              <input id="site_name" name="site_name" className="input" defaultValue={s.site_name} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="site_tagline">
                Подпись бренда
              </label>
              <input id="site_tagline" name="site_tagline" className="input" defaultValue={s.site_tagline} />
            </div>
          </div>
        </section>

        <div className="admin-form__foot">
          <button type="submit" className="btn btn--primary">
            Сохранить настройки
            <span className="btn__arrow" aria-hidden="true" />
          </button>
        </div>
      </form>
    </>
  )
}
