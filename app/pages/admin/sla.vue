<script setup lang="ts">
import type { SlaPolicy } from '#shared/types/domain'
import { PRIORITY_LABELS } from '#shared/utils/labels'

definePageMeta({ middleware: 'admin', title: 'SLA' })
const { data, refresh } = await useAsyncData('admin-sla', () => $fetch<{ policies: SlaPolicy[] }>('/api/admin/sla'))

async function save(policy: SlaPolicy) {
  await $fetch(`/api/admin/sla/${policy.priority}`, {
    method: 'PUT',
    body: {
      responseMinutes: Number(policy.responseMinutes),
      resolutionMinutes: Number(policy.resolutionMinutes),
      isActive: policy.isActive
    }
  })
  await refresh()
}
</script>

<template>
  <div class="space-y-4">
    <h1 class="font-display text-4xl">SLA</h1>
    <article v-for="policy in data?.policies || []" :key="policy.id" class="rounded-3xl bg-white p-4">
      <h2 class="font-display text-2xl">{{ PRIORITY_LABELS[policy.priority] }}</h2>
      <div class="mt-3 grid gap-3 md:grid-cols-2">
        <label class="text-sm">Реакция, мин.
          <input v-model.number="policy.responseMinutes" type="number" class="mt-1 w-full rounded-xl border border-ink/15 px-3 py-2">
        </label>
        <label class="text-sm">Решение, мин.
          <input v-model.number="policy.resolutionMinutes" type="number" class="mt-1 w-full rounded-xl border border-ink/15 px-3 py-2">
        </label>
      </div>
      <div class="mt-3">
        <AppButton @click="save(policy)">Сохранить</AppButton>
      </div>
    </article>
  </div>
</template>
