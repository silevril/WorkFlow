<script setup lang="ts">
import type { RequestListItem } from '~/composables/useRequestsList'
import { requestNumber } from '#shared/utils/labels'
import { slaState } from '#shared/utils/sla'

defineProps<{ item: RequestListItem }>()

function slaClass(due: string | null) {
  const state = slaState(due)
  if (state === 'overdue') return 'text-danger'
  if (state === 'soon') return 'text-warn'
  return 'text-ink-soft'
}
</script>

<template>
  <NuxtLink
    :to="`/requests/${item.id}`"
    class="block rounded-2xl border border-ink/10 bg-white p-4 transition hover:border-copper/40 hover:shadow-sm"
  >
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="text-xs text-ink-soft">{{ requestNumber(item.number) }} · {{ item.customerCompany || item.customerName || 'Клиент' }}</p>
        <h3 class="mt-1 break-words font-medium">{{ item.title || 'Без названия' }}</h3>
      </div>
      <StatusBadge :status="item.status" />
    </div>
    <div class="mt-3 flex flex-wrap items-center gap-3 text-sm">
      <PriorityBadge :priority="item.priority" />
      <span>{{ item.assigneeName || 'Без исполнителя' }}</span>
      <span :class="slaClass(item.slaDueAt)">SLA {{ formatDate(item.slaDueAt) }}</span>
    </div>
  </NuxtLink>
</template>
