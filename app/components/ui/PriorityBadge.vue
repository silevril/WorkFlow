<script setup lang="ts">
import type { RequestPriority } from '#shared/types/domain'
import { PRIORITY_LABELS } from '#shared/utils/labels'

defineProps<{ priority: RequestPriority }>()
</script>

<template>
  <span class="text-xs font-medium uppercase tracking-wide text-ink-soft">
    {{ PRIORITY_LABELS[priority] }}
  </span>
</template>
