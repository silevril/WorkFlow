export default defineNuxtRouteMiddleware(async () => {
  const { user, ready, fetchUser } = useAuth()
  if (!ready.value) await fetchUser()
  if (!user.value) return navigateTo('/login')
  if (user.value.role !== 'admin') return navigateTo('/dashboard')
})
