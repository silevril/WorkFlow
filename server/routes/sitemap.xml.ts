export default defineEventHandler((event) => {
  const origin = getRequestURL(event).origin
  const urls = [
    '/',
    '/faq',
    '/help',
    '/articles',
    '/login',
    '/register',
    ...ARTICLES.map(article => `/articles/${article.slug}`),
    ...HELP_PAGES.map(page => `/help/${page.slug}`)
  ]
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url><loc>${origin}${url}</loc></url>`).join('\n')}
</urlset>`
  setHeader(event, 'content-type', 'application/xml')
  return body
})
