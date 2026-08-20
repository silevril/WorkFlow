import type { Request, RequestPriority, RequestStatus } from '#shared/types/domain'

export function useRequestMutations() {
  const { messageOf } = useApiError()
  const undo = useUndoStore()
  const busy = ref(false)
  const errorMessage = ref<string | null>(null)

  async function patchRequest(id: string, body: Record<string, unknown>, previous?: Request) {
    busy.value = true
    errorMessage.value = null
    try {
      const result = await $fetch<{ request: Request }>(`/api/requests/${id}`, {
        method: 'PATCH',
        body
      })
      return result.request
    } catch (error) {
      errorMessage.value = messageOf(error)
      throw error
    } finally {
      busy.value = false
    }
  }

  async function changePriority(request: Request, priority: RequestPriority) {
    const previous = request.priority
    request.priority = priority
    try {
      const updated = await patchRequest(request.id, { priority, version: request.version })
      Object.assign(request, updated)
      undo.set({
        label: 'Отменить приоритет',
        run: async () => {
          const rolled = await $fetch<{ request: Request }>(`/api/requests/${request.id}`, {
            method: 'PATCH',
            body: { priority: previous, version: request.version }
          })
          Object.assign(request, rolled.request)
        }
      })
    } catch (error) {
      request.priority = previous
      throw error
    }
  }

  async function transition(request: Request, to: RequestStatus, extra: Record<string, unknown> = {}) {
    const previous = { status: request.status, version: request.version }
    const result = await $fetch<{ request: Request }>(`/api/requests/${request.id}/transition`, {
      method: 'POST',
      body: { to, version: request.version, ...extra }
    })
    Object.assign(request, result.request)
    undo.set({
      label: 'Отменить статус',
      run: async () => {
        errorMessage.value = 'Предыдущий статус нельзя вернуть автоматически, если переход необратим. Обновите карточку.'
        void previous
      }
    })
    return result.request
  }

  async function addComment(requestId: string, body: string) {
    const idempotencyKey = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    return $fetch(`/api/requests/${requestId}/comments`, {
      method: 'POST',
      body: { body, idempotencyKey }
    })
  }

  return { busy, errorMessage, patchRequest, changePriority, transition, addComment }
}
