<script setup lang="ts">
definePageMeta({ layout: 'public' })
useSeoMeta({ title: 'Статьи — WorkFlow', description: 'Практика работы с заявками, SLA и ролями.' })
const { data } = await useFetch('/api/articles')
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-16">
    <h1 class="font-display text-5xl">Статьи</h1>
    <div class="mt-8 grid gap-3">
      <NuxtLink
        v-for="article in data?.articles || []"
        :key="article.slug"
        :to="`/articles/${article.slug}`"
        class="rounded-3xl bg-white p-6"
      >
        <h2 class="font-display text-2xl">{{ article.title }}</h2>
        <p class="mt-2 text-ink-soft">{{ article.description }}</p>
      </NuxtLink>
    </div>
  </div>
</template>
