import type { Paginated, Request, RequestFilters } from '#shared/types/domain'

export interface RequestListItem extends Request {
  customerName: string | null
  customerCompany: string | null
  assigneeName: string | null
  categoryName: string | null
}

export function useRequestsList() {
  const route = useRoute()
  const router = useRouter()
  const searchInput = ref(typeof route.query.q === 'string' ? route.query.q : '')
  const debouncedQ = useDebouncedRef(searchInput, 350)
  const requestSeq = ref(0)
  let abort: AbortController | null = null
  let latest: Paginated<RequestListItem> = { items: [], total: 0, page: 1, pageSize: 10 }
  const status = computed(() => typeof route.query.status === 'string' ? route.query.status : '')
  const priority = computed(() => typeof route.query.priority === 'string' ? route.query.priority : '')
  const sort = computed(() => typeof route.query.sort === 'string' ? route.query.sort : 'created_desc')
  const page = computed(() => Math.max(1, Number(route.query.page) || 1))
  const mine = computed(() => route.query.mine === '1')

  const queryKey = computed(() => JSON.stringify({
    q: debouncedQ.value,
    status: status.value,
    priority: priority.value,
    sort: sort.value,
    page: page.value,
    mine: mine.value
  }))

  const { data, pending, error, refresh } = useAsyncData(
    () => `requests-${queryKey.value}`,
    async () => {
      abort?.abort()
      const controller = new AbortController()
      abort = controller
      const seq = ++requestSeq.value
      try {
        const result = await $fetch<Paginated<RequestListItem>>('/api/requests', {
          signal: controller.signal,
          query: {
            q: debouncedQ.value || undefined,
            status: status.value || undefined,
            priority: priority.value || undefined,
            sort: sort.value,
            page: page.value,
            mine: mine.value ? '1' : undefined
          }
        })
        if (seq !== requestSeq.value) return latest
        latest = result
        return result
      } catch (err) {
        if (controller.signal.aborted) return latest
        throw err
      }
    },
    { watch: [queryKey], default: () => ({ items: [], total: 0, page: 1, pageSize: 10 }) }
  )

  async function setFilters(next: Partial<RequestFilters & { mine?: boolean }>) {
    const nextStatus = next.status === '' ? undefined : (next.status ?? (status.value || undefined))
    const nextPriority = next.priority === '' ? undefined : (next.priority ?? (priority.value || undefined))
    const nextMine = next.mine ?? mine.value
    await router.push({
      query: {
        ...route.query,
        q: next.q ?? (searchInput.value || undefined),
        status: nextStatus,
        priority: nextPriority,
        sort: next.sort ?? sort.value,
        page: String(next.page ?? 1),
        mine: nextMine ? '1' : undefined
      }
    })
  }

  watch(debouncedQ, async (value) => {
    if ((typeof route.query.q === 'string' ? route.query.q : '') === value) return
    await router.push({
      query: {
        ...route.query,
        q: value || undefined,
        page: '1'
      }
    })
  })

  return {
    searchInput,
    status,
    priority,
    sort,
    page,
    mine,
    data,
    pending,
    error,
    refresh,
    setFilters
  }
}
