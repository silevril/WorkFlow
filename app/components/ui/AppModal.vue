<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })
defineProps<{ title: string }>()

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') open.value = false
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 md:items-center" @keydown="onKey">
    <div
      role="dialog"
      aria-modal="true"
      :aria-labelledby="'modal-title'"
      class="max-h-[90vh] w-full max-w-lg overflow-auto rounded-3xl bg-paper p-5 shadow-xl"
    >
      <div class="mb-4 flex items-center justify-between gap-3">
        <h2 id="modal-title" class="font-display text-2xl">{{ title }}</h2>
        <AppButton variant="ghost" @click="open = false">Закрыть</AppButton>
      </div>
      <slot />
    </div>
  </div>
</template>
