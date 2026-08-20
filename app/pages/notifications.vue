<script setup lang="ts">
definePageMeta({ middleware: 'auth', title: 'Уведомления' })
const { data, pending, unread, markRead, refresh } = useNotifications()
</script>

<template>
  <div class="space-y-4">
    <h1 class="font-display text-4xl">Уведомления</h1>
    <p class="text-ink-soft">Непрочитанных: {{ unread }}</p>
    <SkeletonList v-if="pending" />
    <EmptyState v-else-if="!data?.notifications.length" title="Пока тихо" />
    <article v-for="item in data?.notifications || []" :key="item.id" class="rounded-2xl bg-white p-4">
      <h2 class="font-medium">{{ item.title }}</h2>
      <p class="text-sm text-ink-soft">{{ item.body }}</p>
      <div class="mt-2 flex gap-3 text-sm">
        <NuxtLink v-if="item.requestId" :to="`/requests/${item.requestId}`" class="text-copper">Открыть заявку</NuxtLink>
        <button v-if="!item.readAt" type="button" class="hover:underline" @click="markRead(item.id)">Прочитано</button>
      </div>
    </article>
    <AppButton variant="ghost" @click="refresh">Обновить</AppButton>
  </div>
</template>
