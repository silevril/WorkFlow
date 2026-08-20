<script setup lang="ts">
import type { Category, RequestPriority } from '#shared/types/domain'
import { REQUEST_PRIORITIES } from '#shared/types/domain'
import { PRIORITY_LABELS } from '#shared/utils/labels'

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ created: [] }>()
const { data: categories } = await useFetch<{ categories: Category[] }>('/api/categories')
const title = ref('')
const description = ref('')
const priority = ref<RequestPriority>('normal')
const categoryId = ref('')
const error = ref('')
const pending = ref(false)

async function create() {
  pending.value = true
  error.value = ''
  try {
    await $fetch('/api/requests', {
      method: 'POST',
      body: {
        title: title.value,
        description: description.value,
        priority: priority.value,
        categoryId: categoryId.value || null
      }
    })
    open.value = false
    title.value = ''
    description.value = ''
    emit('created')
  } catch (err) {
    error.value = useApiError().messageOf(err)
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <AppModal v-model:open="open" title="Новая заявка">
    <form class="space-y-3" @submit.prevent="create">
      <AppInput id="req-title" v-model="title" label="Заголовок" />
      <div>
        <label for="req-desc" class="mb-1 block text-sm font-medium">Описание</label>
        <textarea id="req-desc" v-model="description" rows="5" class="w-full rounded-xl border border-ink/15 p-3 text-sm" />
      </div>
      <AppSelect id="req-priority" v-model="priority" label="Приоритет">
        <option v-for="item in REQUEST_PRIORITIES" :key="item" :value="item">{{ PRIORITY_LABELS[item] }}</option>
      </AppSelect>
      <AppSelect id="req-category" v-model="categoryId" label="Категория">
        <option value="">Без категории</option>
        <option v-for="item in categories?.categories || []" :key="item.id" :value="item.id">{{ item.name }}</option>
      </AppSelect>
      <p v-if="error" class="text-sm text-danger">{{ error }}</p>
      <AppButton type="submit" :disabled="pending">Создать</AppButton>
    </form>
  </AppModal>
</template>
