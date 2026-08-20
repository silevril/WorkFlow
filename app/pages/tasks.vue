<script setup lang="ts">
import type { RequestListItem } from '~/composables/useRequestsList'

definePageMeta({ middleware: 'auth', title: 'Мои задачи' })
const { data, pending, error, refresh } = await useAsyncData('tasks', () =>
  $fetch<{ items: RequestListItem[] }>('/api/requests', { query: { mine: '1', status: 'open', sort: 'sla_asc' } })
)
</script>

<template>
  <div class="space-y-4">
    <h1 class="font-display text-4xl">Задачи</h1>
    <p class="text-ink-soft">Открытые заявки, назначенные вам или связанные с вашим профилем.</p>
    <SkeletonList v-if="pending" />
    <ErrorState v-else-if="error" title="Не удалось загрузить задачи" :text="useApiError().messageOf(error)" @retry="refresh" />
    <EmptyState v-else-if="!data?.items.length" title="Нет активных задач" />
    <RequestList v-else :items="data.items" />
  </div>
</template>
