export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')
  const page = HELP_PAGES.find(item => item.slug === slug)
  if (!page) throw apiFail(404, 'Страница помощи не найдена', 'NOT_FOUND')
  return { page }
})
