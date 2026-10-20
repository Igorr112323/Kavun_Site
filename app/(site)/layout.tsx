import '../site.css'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { CompareBar } from '@/components/compare'
import { MobileCallBar } from '@/components/mobile-call-bar'
import { SiteSettingsProvider } from '@/components/site-settings'
import { getSettings } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = getSettings()
  const logoVariant = settings.logo_variant || 'profile'

  return (
    <SiteSettingsProvider
      value={{
        phoneDisplay: settings.phone_display,
        phoneHref: settings.phone_href,
        email: settings.email,
      }}
    >
      <a className="skip-link" href="#main">
        Перейти к содержанию
      </a>
      <SiteHeader settings={settings} logoVariant={logoVariant} />
      <main id="main">{children}</main>
      <SiteFooter settings={settings} logoVariant={logoVariant} />
      <CompareBar />
      <MobileCallBar phoneDisplay={settings.phone_display} phoneHref={settings.phone_href} />
    </SiteSettingsProvider>
  )
}
