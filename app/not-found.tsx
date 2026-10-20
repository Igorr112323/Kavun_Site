import './site.css'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { NotFoundBlock } from '@/components/not-found-block'
import { getSettings } from '@/lib/data'

export default function NotFound() {
  const settings = getSettings()
  return (
    <>
      <SiteHeader settings={settings} logoVariant={settings.logo_variant || 'profile'} />
      <main>
        <NotFoundBlock />
      </main>
      <SiteFooter settings={settings} logoVariant={settings.logo_variant || 'profile'} />
    </>
  )
}
