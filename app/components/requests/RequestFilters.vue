<script setup lang="ts">
import { REQUEST_PRIORITIES, REQUEST_STATUSES } from '#shared/types/domain'
import { PRIORITY_LABELS, STATUS_LABELS } from '#shared/utils/labels'

const props = defineProps<{
  status: string
  priority: string
  sort: string
  search: string
}>()
const emit = defineEmits<{
  'update:status': [value: string]
  'update:priority': [value: string]
  'update:sort': [value: string]
  'update:search': [value: string]
}>()
</script>

<template>
  <div class="grid gap-3 rounded-2xl border border-ink/10 bg-white p-4 md:grid-cols-4">
    <div>
      <label for="filter-search" class="mb-1 block text-xs font-medium">Поиск</label>
      <input
        id="filter-search"
        :value="props.search"
        class="w-full rounded-xl border border-ink/15 px-3 py-2 text-sm"
        placeholder="Заголовок или описание"
        @input="emit('update:search', ($event.target as HTMLInputElement).value)"
      >
    </div>
    <div>
      <label for="filter-status" class="mb-1 block text-xs font-medium">Статус</label>
      <select id="filter-status" :value="props.status" class="w-full rounded-xl border border-ink/15 px-3 py-2 text-sm" @change="emit('update:status', ($event.target as HTMLSelectElement).value)">
        <option value="">Все</option>
        <option value="open">Открытые</option>
        <option v-for="item in REQUEST_STATUSES" :key="item" :value="item">{{ STATUS_LABELS[item] }}</option>
      </select>
    </div>
    <div>
      <label for="filter-priority" class="mb-1 block text-xs font-medium">Приоритет</label>
      <select id="filter-priority" :value="props.priority" class="w-full rounded-xl border border-ink/15 px-3 py-2 text-sm" @change="emit('update:priority', ($event.target as HTMLSelectElement).value)">
        <option value="">Все</option>
        <option v-for="item in REQUEST_PRIORITIES" :key="item" :value="item">{{ PRIORITY_LABELS[item] }}</option>
      </select>
    </div>
    <div>
      <label for="filter-sort" class="mb-1 block text-xs font-medium">Сортировка</label>
      <select id="filter-sort" :value="props.sort" class="w-full rounded-xl border border-ink/15 px-3 py-2 text-sm" @change="emit('update:sort', ($event.target as HTMLSelectElement).value)">
        <option value="created_desc">Сначала новые</option>
        <option value="created_asc">Сначала старые</option>
        <option value="sla_asc">Ближе SLA</option>
        <option value="priority_desc">По приоритету</option>
      </select>
    </div>
  </div>
</template>
