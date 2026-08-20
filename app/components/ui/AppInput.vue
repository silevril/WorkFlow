<script setup lang="ts">
defineProps<{
  id: string
  label: string
  error?: string
  type?: string
}>()
const model = defineModel<string>({ default: '' })
</script>

<template>
  <div class="space-y-1">
    <label :for="id" class="block text-sm font-medium">{{ label }}</label>
    <input
      :id="id"
      v-model="model"
      :type="type || 'text'"
      class="w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm"
      :aria-invalid="Boolean(error)"
      :aria-describedby="error ? `${id}-error` : undefined"
    >
    <p v-if="error" :id="`${id}-error`" class="text-sm text-danger">{{ error }}</p>
  </div>
</template>
