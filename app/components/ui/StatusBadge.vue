<script setup lang="ts">
import type { RequestStatus } from '#shared/types/domain'
import { STATUS_LABELS } from '#shared/utils/labels'

defineProps<{ status: RequestStatus }>()

const tone: Record<RequestStatus, string> = {
  new: 'bg-paper-2 text-ink',
  assigned: 'bg-teal/15 text-teal-dark',
  in_progress: 'bg-copper/15 text-copper-dark',
  waiting: 'bg-warn/15 text-warn',
  resolved: 'bg-ok/15 text-ok',
  closed: 'bg-ink/10 text-ink-soft',
  escalated: 'bg-danger/15 text-danger'
}
</script>

<template>
  <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium" :class="tone[status]">
    {{ STATUS_LABELS[status] }}
  </span>
</template>
