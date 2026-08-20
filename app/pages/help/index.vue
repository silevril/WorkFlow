<script setup lang="ts">
definePageMeta({ layout: 'public' })
useSeoMeta({ title: 'Help Center — WorkFlow', description: 'Справка по фильтрам, ролям и клавиатурной навигации.' })
const { data } = await useFetch('/api/help')
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-16">
    <h1 class="font-display text-5xl">Help Center</h1>
    <div class="mt-8 grid gap-3">
      <NuxtLink
        v-for="page in data?.pages || []"
        :key="page.slug"
        :to="`/help/${page.slug}`"
        class="rounded-3xl bg-white p-6 hover:border-copper"
      >
        <h2 class="font-display text-2xl">{{ page.title }}</h2>
      </NuxtLink>
    </div>
  </div>
</template>
