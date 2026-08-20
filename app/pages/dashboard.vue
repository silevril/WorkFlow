<script setup lang="ts">
import type { RequestListItem } from '~/composables/useRequestsList'

definePageMeta({ middleware: 'auth', title: 'Обзор' })
const { user } = useAuth()
const { data, pending, error, refresh } = await useAsyncData('dashboard-requests', () =>
  $fetch<{ items: RequestListItem[] }>('/api/requests', { query: { pageSize: 6, sort: 'sla_asc' } })
)
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="font-display text-4xl">Здравствуйте, {{ user?.name }}</h1>
      <p class="mt-2 text-ink-soft">Роль: {{ user?.role }}. Ниже — ближайшие по SLA заявки в вашей зоне видимости.</p>
    </div>
    <SkeletonList v-if="pending" />
    <ErrorState v-else-if="error" title="Не удалось загрузить обзор" :text="useApiError().messageOf(error)" @retry="refresh" />
    <EmptyState v-else-if="!data?.items.length" title="Пока нет заявок" text="Создайте первую заявку или дождитесь назначения." />
    <RequestList v-else :items="data.items" />
  </div>
</template>
