<script setup lang="ts">
defineProps<{
  title: string
  text?: string
}>()
const emit = defineEmits<{ retry: [] }>()
</script>

<template>
  <div class="rounded-3xl border border-danger/20 bg-white px-6 py-8" role="alert">
    <h2 class="font-display text-2xl">{{ title }}</h2>
    <p v-if="text" class="mt-2 text-ink-soft">{{ text }}</p>
    <div class="mt-4">
      <AppButton variant="copper" @click="emit('retry')">Повторить</AppButton>
    </div>
  </div>
</template>
