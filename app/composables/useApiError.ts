export function useApiError() {
  function messageOf(error: unknown): string {
    if (!error || typeof error !== 'object') return 'Неизвестная ошибка'
    const err = error as {
      statusMessage?: string
      data?: { statusMessage?: string, message?: string, data?: { code?: string } }
      message?: string
    }
    return err.data?.statusMessage || err.statusMessage || err.message || 'Неизвестная ошибка'
  }

  function isRetryable(error: unknown): boolean {
    const status = (error as { statusCode?: number })?.statusCode
    return status === 429 || status === 500 || status === 502 || status === 503
  }

  return { messageOf, isRetryable }
}
