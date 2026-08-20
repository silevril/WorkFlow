<script setup lang="ts">
import type { Customer } from '#shared/types/domain'

definePageMeta({ middleware: 'staff', title: 'Клиенты' })
const q = ref('')
const debounced = useDebouncedRef(q, 300)
const { data, pending, error, refresh } = await useAsyncData(
  () => `customers-${debounced.value}`,
  () => $fetch<{ customers: Array<Customer & { requestsCount: number }> }>('/api/customers', { query: { q: debounced.value || undefined } })
)
</script>

<template>
  <div class="space-y-4">
    <h1 class="font-display text-4xl">Клиенты</h1>
    <label for="customer-search" class="text-sm">Поиск</label>
    <input id="customer-search" v-model="q" class="w-full max-w-md rounded-xl border border-ink/15 px-3 py-2" placeholder="Компания или имя">
    <SkeletonList v-if="pending" />
    <ErrorState v-else-if="error" title="Ошибка" :text="useApiError().messageOf(error)" @retry="refresh" />
    <EmptyState v-else-if="!data?.customers.length" title="Клиенты не найдены" />
    <div v-else class="grid gap-3">
      <NuxtLink
        v-for="item in data.customers"
        :key="item.id"
        :to="`/customers/${item.id}`"
        class="rounded-2xl bg-white p-4 hover:border-copper"
      >
        <h2 class="font-medium">{{ item.company }}</h2>
        <p class="text-sm text-ink-soft">{{ item.name }} · {{ item.email }} · заявок: {{ item.requestsCount }}</p>
      </NuxtLink>
    </div>
  </div>
</template>
