import type { Notification } from '#shared/types/domain'

export function useNotifications() {
  const { data, refresh, pending } = useAsyncData('notifications', () =>
    $fetch<{ notifications: Notification[] }>('/api/notifications')
  )
  const unread = computed(() => data.value?.notifications.filter(item => !item.readAt).length ?? 0)

  async function markRead(id: string) {
    await $fetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
    await refresh()
  }

  return { data, refresh, pending, unread, markRead }
}
