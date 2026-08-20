<script setup lang="ts">
import type { RequestEvent } from '#shared/types/domain'

defineProps<{ events: RequestEvent[] }>()
</script>

<template>
  <ol class="space-y-3 border-l border-ink/15 pl-4">
    <li v-for="event in events" :key="event.id" class="relative">
      <span class="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-copper" />
      <p class="text-sm font-medium">{{ event.type }} · {{ event.actorName || 'система' }}</p>
      <p class="text-xs text-ink-soft">{{ formatDate(event.createdAt) }}</p>
    </li>
  </ol>
</template>
