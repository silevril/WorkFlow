<script setup lang="ts">
const links = [
  { to: '/', label: 'Продукт' },
  { to: '/faq', label: 'FAQ' },
  { to: '/help', label: 'Help' },
  { to: '/articles', label: 'Статьи' }
]
</script>

<template>
  <div class="min-h-screen bg-paper text-ink wf-grid">
    <a href="#content" class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:px-3 focus:py-2">
      К содержимому
    </a>
    <header class="border-b border-ink/10 bg-paper/90 backdrop-blur">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <NuxtLink to="/" class="font-display text-2xl tracking-tight">
          WorkFlow
        </NuxtLink>
        <nav class="hidden items-center gap-6 md:flex" aria-label="Публичное меню">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="text-sm text-ink-soft hover:text-ink"
            active-class="text-ink font-medium"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>
        <div class="flex items-center gap-2">
          <NuxtLink to="/login" class="rounded-full px-3 py-2 text-sm hover:bg-paper-2">Войти</NuxtLink>
          <NuxtLink to="/register" class="rounded-full bg-ink px-4 py-2 text-sm text-paper hover:bg-ink-soft">Регистрация</NuxtLink>
        </div>
      </div>
      <nav class="flex gap-4 overflow-x-auto px-4 pb-3 md:hidden" aria-label="Мобильное меню">
        <NuxtLink v-for="link in links" :key="link.to" :to="link.to" class="whitespace-nowrap text-sm text-ink-soft">
          {{ link.label }}
        </NuxtLink>
      </nav>
    </header>
    <main id="content">
      <slot />
    </main>
    <footer class="border-t border-ink/10 px-4 py-8 text-sm text-ink-soft">
      <div class="mx-auto flex max-w-6xl flex-col gap-2 md:flex-row md:justify-between">
        <p>WorkFlow — учебный сервис заявок для корпоративного обслуживания.</p>
        <p>Nuxt 4 · PostgreSQL · Nitro</p>
      </div>
    </footer>
  </div>
</template>
