<script setup lang="ts">
definePageMeta({ middleware: 'auth', title: 'Заявки' })
const { user } = useAuth()
const {
  searchInput,
  status,
  priority,
  sort,
  page,
  data,
  pending,
  error,
  refresh,
  setFilters
} = useRequestsList()
const { messageOf, isRetryable } = useApiError()
const createOpen = ref(false)
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="font-display text-4xl">Заявки</h1>
      <AppButton v-if="user?.role === 'client' || user?.role === 'operator' || user?.role === 'admin'" @click="createOpen = true">
        Новая заявка
      </AppButton>
    </div>
    <RequestFilters
      :status="status"
      :priority="priority"
      :sort="sort"
      :search="searchInput"
      @update:status="setFilters({ status: $event as never, page: 1 })"
      @update:priority="setFilters({ priority: $event as never, page: 1 })"
      @update:sort="setFilters({ sort: $event as never, page: 1 })"
      @update:search="searchInput = $event"
    />
    <SkeletonList v-if="pending" />
    <ErrorState
      v-else-if="error"
      title="Ошибка загрузки"
      :text="messageOf(error)"
      @retry="refresh()"
    />
    <EmptyState v-else-if="!data?.items.length" title="Ничего не найдено" text="Снимите фильтры или измените поисковый запрос." />
    <template v-else>
      <RequestList :items="data.items" />
      <div class="flex items-center justify-between pt-2 text-sm">
        <span>Всего {{ data.total }}</span>
        <div class="flex gap-2">
          <AppButton variant="ghost" :disabled="page <= 1" @click="setFilters({ page: page - 1 })">Назад</AppButton>
          <AppButton variant="ghost" :disabled="page * (data.pageSize || 10) >= data.total" @click="setFilters({ page: page + 1 })">Вперёд</AppButton>
        </div>
      </div>
    </template>
    <p v-if="error && isRetryable(error)" class="text-sm text-ink-soft">Ошибка временная — можно повторить запрос.</p>
    <CreateRequestModal v-model:open="createOpen" @created="refresh()" />
  </div>
</template>
