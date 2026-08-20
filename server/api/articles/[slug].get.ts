export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')
  const article = ARTICLES.find(item => item.slug === slug)
  if (!article) throw apiFail(404, 'Статья не найдена', 'NOT_FOUND')
  return { article }
})
