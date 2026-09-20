import { next } from '@vercel/functions'

export const config = {
  matcher: ['/registro/:id'],
}

// Só bots de preview de link (WhatsApp, Twitter/X, Facebook, LinkedIn, Telegram,
// Discord, Slack etc.) recebem HTML com meta tags — pessoas de verdade continuam
// recebendo o app (SPA) normalmente, sem nenhuma mudança de comportamento.
const BOT_UA = /facebookexternalhit|Facebot|Twitterbot|WhatsApp|TelegramBot|Slackbot|LinkedInBot|Discordbot|SkypeUriPreview|Pinterest|redditbot|Applebot|vkShare|Iframely/i

const SUPABASE_URL = 'https://favjjteevfwnwautuaxi.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhdmpqdGVldmZ3bndhdXR1YXhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2MjA0NjgsImV4cCI6MjEwMTE5NjQ2OH0.-gxOKUKSBT78Pqi1jCnT4biZNCPRA5x90dz-LS5pi0w'

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export default async function middleware(request: Request) {
  const userAgent = request.headers.get('user-agent') ?? ''
  if (!BOT_UA.test(userAgent)) return next()

  const url = new URL(request.url)
  const id = url.pathname.split('/').filter(Boolean).pop() ?? ''
  const fallbackImage = `${url.origin}/icons/icon-512.png`

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/sightings_public?id=eq.${encodeURIComponent(id)}&select=species_display_name,reported_name,municipio,observation_date,primary_photo_url`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } },
    )
    const rows = res.ok ? await res.json() : []
    const sighting = Array.isArray(rows) ? rows[0] : null

    const speciesName = sighting?.species_display_name ?? sighting?.reported_name ?? 'Avistamento de serpente'
    const municipio = sighting?.municipio ?? 'Paraíba'
    const title = `${speciesName} — ${municipio}`
    const description = sighting
      ? `Registro em ${municipio}. Veja detalhes no catálogo colaborativo de serpentes da Paraíba.`
      : 'Catálogo colaborativo de serpentes da Paraíba.'
    const image = sighting?.primary_photo_url || fallbackImage

    const html = `<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"/>
<title>${escapeHtml(title)}</title>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="É uma cobra venenosa?"/>
<meta property="og:title" content="${escapeHtml(title)}"/>
<meta property="og:description" content="${escapeHtml(description)}"/>
<meta property="og:image" content="${escapeHtml(image)}"/>
<meta property="og:url" content="${escapeHtml(url.toString())}"/>
<meta property="og:locale" content="pt_BR"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${escapeHtml(title)}"/>
<meta name="twitter:description" content="${escapeHtml(description)}"/>
<meta name="twitter:image" content="${escapeHtml(image)}"/>
</head><body></body></html>`

    return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } })
  } catch {
    return next()
  }
}
