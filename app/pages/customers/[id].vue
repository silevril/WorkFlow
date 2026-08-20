<script setup lang="ts">
import type { Customer, Request } from '#shared/types/domain'
import type { RequestListItem } from '~/composables/useRequestsList'

definePageMeta({ middleware: 'staff', title: 'Клиент' })
const route = useRoute()
const { data, error, refresh } = await useAsyncData(
  () => `customer-${route.params.id}`,
  () => $fetch<{ customer: Customer, requests: Request[] }>(`/api/customers/${route.params.id}`)
)
if (error.value) throw createError({ statusCode: 404, statusMessage: 'Клиент не найден' })

const items = computed<RequestListItem[]>(() =>
  (data.value?.requests || []).map(item => ({
    ...item,
    customerName: data.value?.customer.name ?? null,
    customerCompany: data.value?.customer.company ?? null,
    assigneeName: null,
    categoryName: null
  }))
)
</script>

<template>
  <div v-if="data" class="space-y-4">
    <h1 class="font-display text-4xl">{{ data.customer.company }}</h1>
    <p class="text-ink-soft">{{ data.customer.name }} · {{ data.customer.email }} · {{ data.customer.phone }}</p>
    <RequestList :items="items" />
    <AppButton variant="ghost" @click="refresh">Обновить</AppButton>
  </div>
</template>
