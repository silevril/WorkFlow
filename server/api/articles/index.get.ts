export default defineEventHandler(() => {
  return {
    articles: ARTICLES.map(({ body, ...rest }) => rest)
  }
})
