<script setup lang="ts">
import type { Category } from '#shared/types/domain'

definePageMeta({ middleware: 'admin', title: 'Категории' })
const { data, refresh } = await useAsyncData('admin-categories', () => $fetch<{ categories: Category[] }>('/api/admin/categories'))
const name = ref('')
const description = ref('')

async function create() {
  await $fetch('/api/admin/categories', { method: 'POST', body: { name: name.value, description: description.value } })
  name.value = ''
  description.value = ''
  await refresh()
}

async function toggle(item: Category) {
  await $fetch(`/api/admin/categories/${item.id}`, { method: 'PATCH', body: { isActive: !item.isActive } })
  await refresh()
}
</script>

<template>
  <div class="space-y-4">
    <h1 class="font-display text-4xl">Категории</h1>
    <form class="flex flex-wrap gap-2" @submit.prevent="create">
      <AppInput id="cat-name" v-model="name" label="Название" />
      <AppInput id="cat-desc" v-model="description" label="Описание" />
      <div class="self-end">
        <AppButton type="submit">Добавить</AppButton>
      </div>
    </form>
    <article v-for="item in data?.categories || []" :key="item.id" class="flex items-center justify-between rounded-2xl bg-white p-4">
      <div>
        <h2 class="font-medium">{{ item.name }}</h2>
        <p class="text-sm text-ink-soft">{{ item.description }}</p>
      </div>
      <AppButton variant="ghost" @click="toggle(item)">{{ item.isActive ? 'Выключить' : 'Включить' }}</AppButton>
    </article>
  </div>
</template>
