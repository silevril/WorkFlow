<script setup lang="ts">
const error = useError()
const is404 = computed(() => error.value?.statusCode === 404)
</script>

<template>
  <div class="min-h-screen bg-paper px-4 py-16 text-ink wf-grid">
    <div class="mx-auto max-w-xl rounded-3xl bg-white p-8">
      <p class="text-sm uppercase tracking-[0.2em] text-copper">{{ error?.statusCode || 500 }}</p>
      <h1 class="mt-3 font-display text-4xl">
        {{ is404 ? 'Такой страницы нет' : 'Что-то сломалось' }}
      </h1>
      <p class="mt-3 text-ink-soft">{{ error?.statusMessage || 'Неизвестная ошибка' }}</p>
      <div class="mt-6 flex gap-3">
        <NuxtLink to="/" class="rounded-full bg-ink px-4 py-2 text-sm text-paper">На главную</NuxtLink>
        <button type="button" class="rounded-full border border-ink/15 px-4 py-2 text-sm" @click="() => clearError()">Ещё раз</button>
      </div>
    </div>
  </div>
</template>
