import type { PublicUser } from '#shared/types/domain'

export function useAuth() {
  const user = useState<PublicUser | null>('auth-user', () => null)
  const ready = useState('auth-ready', () => false)

  async function fetchUser() {
    try {
      const data = await $fetch<{ user: PublicUser }>('/api/auth/me')
      user.value = data.user
    } catch {
      user.value = null
    } finally {
      ready.value = true
    }
  }

  async function login(email: string, password: string) {
    const data = await $fetch<{ user: PublicUser }>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
      credentials: 'include'
    })
    user.value = data.user
    return data.user
  }

  async function register(payload: { name: string, email: string, password: string, company: string }) {
    const data = await $fetch<{ user: PublicUser }>('/api/auth/register', {
      method: 'POST',
      body: payload
    })
    user.value = data.user
    return data.user
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    await navigateTo('/login')
  }

  return { user, ready, fetchUser, login, register, logout }
}
