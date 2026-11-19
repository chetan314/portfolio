import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Social scrapers need absolute URLs for og:image / canonical.
// Set SITE_URL yourself, or let Vercel provide its production domain.
function siteUrl(): Plugin {
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL
  const url = (process.env.SITE_URL ?? (vercel ? `https://${vercel}` : '')).replace(/\/$/, '')
  return {
    name: 'site-url',
    transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', url),
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), siteUrl()],
})
