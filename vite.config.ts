import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { PREGUNTAS } from './src/contenido/preguntas'
import { PARAMETROS } from './src/lib/parametros'

const env = (globalThis as unknown as { process: { env: Record<string, string | undefined> } }).process.env

/**
 * URL pública del sitio. En Vercel se toma sola del dominio de producción
 * (VERCEL_PROJECT_PRODUCTION_URL); para un dominio propio, define SITE_URL.
 */
const SITIO = (
  env.SITE_URL ??
  (env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:5173')
).replace(/\/+$/, '')

const ANIO = PARAMETROS.vigenteDesde.slice(0, 4)
const HOY = new Date().toISOString().slice(0, 10)

/** JSON dentro de <script>: se escapa "<" para que el texto no pueda cerrar la etiqueta. */
const jsonSeguro = (dato: unknown) => JSON.stringify(dato).replace(/</g, '\\u003c')

function seo(): Plugin {
  const datosEstructurados = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: 'Calculadora de sueldo líquido',
        url: `${SITIO}/`,
        description:
          'Calcula tu sueldo líquido en Chile (AFP, salud, cesantía e impuesto único), el valor de tu hora extra y tu valor hora real.',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Any',
        inLanguage: 'es-CL',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CLP' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: PREGUNTAS.map((p) => ({
          '@type': 'Question',
          name: p.pregunta,
          acceptedAnswer: { '@type': 'Answer', text: p.respuesta },
        })),
      },
    ],
  }

  return {
    name: 'seo',
    transformIndexHtml(html) {
      const verificacion = env.GOOGLE_SITE_VERIFICATION
        ? `<meta name="google-site-verification" content="${env.GOOGLE_SITE_VERIFICATION.replace(/"/g, '')}" />\n    `
        : ''
      return html
        .replaceAll('__SITIO__', SITIO)
        .replaceAll('__ANIO__', ANIO)
        .replace(
          '</head>',
          `    ${verificacion}<script type="application/ld+json">${jsonSeguro(datosEstructurados)}</script>\n  </head>`,
        )
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n\nSitemap: ${SITIO}/sitemap.xml\n`,
      })
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source:
          `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
          `  <url>\n    <loc>${SITIO}/</loc>\n    <lastmod>${HOY}</lastmod>\n  </url>\n` +
          `</urlset>\n`,
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), seo()],
})
