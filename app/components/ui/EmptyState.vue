<script setup lang="ts">
defineProps<{
  title: string
  text?: string
}>()
</script>

<template>
  <div class="rounded-3xl border border-dashed border-ink/20 bg-white/50 px-6 py-12 text-center">
    <h2 class="font-display text-2xl">{{ title }}</h2>
    <p v-if="text" class="mt-2 text-ink-soft">{{ text }}</p>
    <div class="mt-4">
      <slot />
    </div>
  </div>
</template>
