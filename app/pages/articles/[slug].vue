<script setup lang="ts">
definePageMeta({ layout: 'public' })
const route = useRoute()
const { data, error } = await useFetch(() => `/api/articles/${route.params.slug}`)
if (error.value) {
  throw createError({ statusCode: 404, statusMessage: 'Статья не найдена' })
}
useSeoMeta({
  title: () => `${data.value?.article.title || 'Статья'} — WorkFlow`,
  description: () => data.value?.article.description || 'Статья WorkFlow',
  ogTitle: () => data.value?.article.title,
  ogDescription: () => data.value?.article.description
})
</script>

<template>
  <article class="mx-auto max-w-3xl px-4 py-16">
    <p class="text-sm text-ink-soft">Обновлено {{ data?.article.updatedAt }}</p>
    <h1 class="mt-2 font-display text-5xl">{{ data?.article.title }}</h1>
    <p class="mt-8 whitespace-pre-wrap text-lg leading-relaxed">{{ data?.article.body }}</p>
  </article>
</template>
