<script setup lang="ts">
import type { RequestListItem } from '~/composables/useRequestsList'

defineProps<{ items: RequestListItem[] }>()
</script>

<template>
  <div class="grid gap-3">
    <RequestCard v-for="item in items" :key="item.id" :item="item" />
  </div>
</template>
