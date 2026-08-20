<script setup lang="ts">
definePageMeta({ layout: 'public' })
const route = useRoute()
const { data, error } = await useFetch(() => `/api/help/${route.params.slug}`)
if (error.value) {
  throw createError({ statusCode: 404, statusMessage: 'Страница помощи не найдена' })
}
useSeoMeta({
  title: () => `${data.value?.page.title || 'Справка'} — WorkFlow`,
  description: 'Справочная страница WorkFlow.'
})
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-16">
    <h1 class="font-display text-5xl">{{ data?.page.title }}</h1>
    <p class="mt-6 text-lg leading-relaxed">{{ data?.page.body }}</p>
  </div>
</template>
