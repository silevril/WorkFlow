<script setup lang="ts">
definePageMeta({ layout: 'public' })
useSeoMeta({ title: 'FAQ — WorkFlow', description: 'Ответы на частые вопросы по сервисным заявкам.' })
const { data } = await useFetch('/api/faq')
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-16">
    <h1 class="font-display text-5xl">Вопросы</h1>
    <div class="mt-8 space-y-4">
      <article v-for="item in data || []" :key="item.q" class="rounded-3xl bg-white p-6">
        <h2 class="font-display text-2xl">{{ item.q }}</h2>
        <p class="mt-2 text-ink-soft">{{ item.a }}</p>
      </article>
    </div>
  </div>
</template>
