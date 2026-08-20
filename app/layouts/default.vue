<script setup lang="ts">
const { user, logout } = useAuth()
const ui = useUiStore()
const undo = useUndoStore()
const route = useRoute()
const { unread } = useNotifications()

onMounted(() => ui.hydrate())

const nav = computed(() => {
  const items = [
    { to: '/dashboard', label: 'Обзор', roles: ['client', 'operator', 'agent', 'admin'] },
    { to: '/requests', label: 'Заявки', roles: ['client', 'operator', 'agent', 'admin'] },
    { to: '/tasks', label: 'Задачи', roles: ['agent', 'operator', 'admin'] },
    { to: '/customers', label: 'Клиенты', roles: ['operator', 'admin'] },
    { to: '/notifications', label: 'Уведомления', roles: ['client', 'operator', 'agent', 'admin'] },
    { to: '/profile', label: 'Профиль', roles: ['client', 'operator', 'agent', 'admin'] },
    { to: '/admin/users', label: 'Пользователи', roles: ['admin'] },
    { to: '/admin/categories', label: 'Категории', roles: ['admin'] },
    { to: '/admin/sla', label: 'SLA', roles: ['admin'] },
    { to: '/admin/analytics', label: 'Аналитика', roles: ['admin', 'operator'] }
  ]
  return items.filter(item => user.value && item.roles.includes(user.value.role))
})
</script>

<template>
  <div class="min-h-screen bg-paper text-ink">
    <a href="#content" class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:px-3 focus:py-2">
      К содержимому
    </a>
    <div class="flex min-h-screen">
      <aside
        class="sticky top-0 hidden h-screen shrink-0 flex-col border-r border-ink/10 bg-ink text-paper md:flex"
        :class="ui.sidebarCollapsed ? 'w-[76px]' : 'w-60'"
      >
        <div class="flex items-center justify-between px-4 py-5">
          <NuxtLink to="/dashboard" class="font-display text-xl">
            {{ ui.sidebarCollapsed ? 'W' : 'WorkFlow' }}
          </NuxtLink>
          <button type="button" class="rounded p-1 hover:bg-white/10" :aria-expanded="!ui.sidebarCollapsed" aria-label="Свернуть меню" @click="ui.toggleSidebar()">
            ‹
          </button>
        </div>
        <nav class="flex flex-1 flex-col gap-1 px-2" aria-label="Основное меню">
          <NuxtLink
            v-for="item in nav"
            :key="item.to"
            :to="item.to"
            class="rounded-lg px-3 py-2 text-sm text-paper/80 hover:bg-white/10 hover:text-paper"
            active-class="bg-white/15 text-paper"
          >
            <span v-if="!ui.sidebarCollapsed">{{ item.label }}</span>
            <span v-else :title="item.label">{{ item.label.slice(0, 1) }}</span>
          </NuxtLink>
        </nav>
        <p class="px-4 py-4 text-xs text-paper/50">{{ user?.name }}</p>
      </aside>
      <div class="flex min-w-0 flex-1 flex-col">
        <header class="flex items-center justify-between gap-3 border-b border-ink/10 bg-paper/90 px-4 py-3 backdrop-blur">
          <div class="min-w-0">
            <p class="truncate text-sm text-ink-soft">{{ route.meta.title || 'Рабочее пространство' }}</p>
            <p class="truncate font-medium">{{ user?.email }}</p>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-if="undo.entry"
              type="button"
              class="rounded-full border border-ink/15 px-3 py-1.5 text-sm hover:bg-paper-2"
              @click="undo.undo()"
            >
              Undo
            </button>
            <NuxtLink to="/notifications" class="relative rounded-full border border-ink/15 px-3 py-1.5 text-sm hover:bg-paper-2">
              Увед.
              <span v-if="unread" class="absolute -right-1 -top-1 rounded-full bg-copper px-1.5 text-[10px] text-white">{{ unread }}</span>
            </NuxtLink>
            <button type="button" class="rounded-full bg-ink px-3 py-1.5 text-sm text-paper hover:bg-ink-soft" @click="logout">
              Выйти
            </button>
          </div>
        </header>
        <nav class="flex gap-3 overflow-x-auto border-b border-ink/10 px-4 py-2 md:hidden" aria-label="Мобильное меню">
          <NuxtLink v-for="item in nav" :key="item.to" :to="item.to" class="whitespace-nowrap text-sm text-ink-soft">
            {{ item.label }}
          </NuxtLink>
        </nav>
        <main id="content" class="flex-1 px-4 py-6" :class="ui.density === 'compact' ? 'max-w-none' : 'mx-auto w-full max-w-6xl'">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>
