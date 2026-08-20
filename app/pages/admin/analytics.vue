<script setup lang="ts">
definePageMeta({ middleware: 'staff', title: 'Аналитика' })
const { data, refresh } = await useAsyncData('admin-analytics', () => $fetch('/api/admin/analytics'))
const resetting = ref(false)
const { user } = useAuth()

async function resetDemo() {
  resetting.value = true
  await $fetch('/api/admin/reset-demo', { method: 'POST' })
  await refresh()
  resetting.value = false
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="font-display text-4xl">Аналитика</h1>
      <AppButton v-if="user?.role === 'admin'" variant="ghost" :disabled="resetting" @click="resetDemo">Сбросить demo-данные</AppButton>
    </div>
    <div class="grid gap-3 md:grid-cols-3">
      <article class="rounded-3xl bg-white p-5">
        <h2 class="text-sm text-ink-soft">Просрочено SLA</h2>
        <p class="font-display text-4xl">{{ data?.overdue ?? 0 }}</p>
      </article>
      <article v-for="item in data?.byStatus || []" :key="item.status" class="rounded-3xl bg-white p-5">
        <h2 class="text-sm text-ink-soft">{{ item.status }}</h2>
        <p class="font-display text-4xl">{{ item.count }}</p>
      </article>
    </div>
    <section class="rounded-3xl bg-white p-5">
      <h2 class="font-display text-2xl">Загрузка исполнителей</h2>
      <ul class="mt-3 space-y-2">
        <li v-for="item in data?.agentLoad || []" :key="item.id" class="flex justify-between text-sm">
          <span>{{ item.name }}</span>
          <span>{{ item.openCount }} открытых</span>
        </li>
      </ul>
    </section>
  </div>
</template>
