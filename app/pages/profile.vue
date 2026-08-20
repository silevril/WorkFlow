<script setup lang="ts">
definePageMeta({ middleware: 'auth', title: 'Профиль' })
const { user } = useAuth()
const ui = useUiStore()
</script>

<template>
  <div class="max-w-lg space-y-4">
    <h1 class="font-display text-4xl">Профиль</h1>
    <div class="rounded-3xl bg-white p-5">
      <p><strong>{{ user?.name }}</strong></p>
      <p class="text-ink-soft">{{ user?.email }}</p>
      <p class="mt-2 text-sm">Роль: {{ user?.role }} · статус: {{ user?.status }}</p>
    </div>
    <div class="rounded-3xl bg-white p-5">
      <h2 class="font-display text-2xl">Интерфейс</h2>
      <p class="mt-1 text-sm text-ink-soft">Настройки хранятся локально и переживают обновление страницы.</p>
      <div class="mt-3 flex gap-2">
        <AppButton :variant="ui.density === 'comfortable' ? 'primary' : 'ghost'" @click="ui.setDensity('comfortable')">Комфортный</AppButton>
        <AppButton :variant="ui.density === 'compact' ? 'primary' : 'ghost'" @click="ui.setDensity('compact')">Плотный</AppButton>
      </div>
    </div>
  </div>
</template>
