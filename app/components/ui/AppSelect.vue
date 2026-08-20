<script setup lang="ts">
defineProps<{
  id: string
  label: string
}>()
const model = defineModel<string>({ default: '' })
</script>

<template>
  <div class="space-y-1">
    <label :for="id" class="block text-sm font-medium">{{ label }}</label>
    <select
      :id="id"
      v-model="model"
      class="w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm"
    >
      <slot />
    </select>
  </div>
</template>
