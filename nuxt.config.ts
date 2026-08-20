import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: ['@pinia/nuxt', '@nuxt/eslint'],
  components: [{ path: '~/components', pathPrefix: false }],
  vite: {
    plugins: [tailwindcss()]
  },
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL || '',
    sessionPassword: process.env.NUXT_SESSION_PASSWORD || 'workflow-dev-session-password-32ch',
    apiLatencyMs: Number(process.env.API_LATENCY_MS || 0),
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }
  },
  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=IBM+Plex+Sans:wght@400;500;600&display=swap'
        }
      ]
    }
  },
  routeRules: {
    '/': { prerender: false, swr: 60 },
    '/faq': { swr: 300 },
    '/help': { swr: 300 },
    '/help/**': { swr: 300 },
    '/articles': { swr: 300 },
    '/articles/**': { swr: 300 },
    '/login': { ssr: true },
    '/register': { ssr: true },
    '/dashboard': { ssr: false },
    '/requests/**': { ssr: false },
    '/tasks': { ssr: false },
    '/customers/**': { ssr: false },
    '/notifications': { ssr: false },
    '/profile': { ssr: false },
    '/admin/**': { ssr: false }
  },
  nitro: {
    experimental: {
      openAPI: false
    }
  }
})
