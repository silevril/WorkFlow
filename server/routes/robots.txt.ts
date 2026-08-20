export default defineEventHandler((event) => {
  const origin = getRequestURL(event).origin
  setHeader(event, 'content-type', 'text/plain')
  return `User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /requests
Disallow: /tasks
Disallow: /customers
Disallow: /notifications
Disallow: /profile
Disallow: /admin
Sitemap: ${origin}/sitemap.xml
`
})
