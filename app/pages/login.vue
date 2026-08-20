<script setup lang="ts">
definePageMeta({ layout: 'public', middleware: 'guest' })
useSeoMeta({
  title: 'Вход — WorkFlow',
  description: 'Вход в консоль сервисных заявок WorkFlow.'
})

const email = ref('client@workflow.demo')
const password = ref('DemoPass123!')
const error = ref('')
const pending = ref(false)
const { login } = useAuth()
const accounts = [
  { role: 'Клиент', email: 'client@workflow.demo' },
  { role: 'Оператор', email: 'operator@workflow.demo' },
  { role: 'Исполнитель', email: 'agent@workflow.demo' },
  { role: 'Админ', email: 'admin@workflow.demo' }
]

async function submit() {
  pending.value = true
  error.value = ''
  try {
    await login(email.value, password.value)
    await navigateTo('/dashboard')
  } catch (err) {
    error.value = useApiError().messageOf(err)
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-md px-4 py-16">
    <h1 class="font-display text-4xl">Вход</h1>
    <p class="mt-2 text-ink-soft">Учебные пароли одинаковые: DemoPass123!</p>
    <form class="mt-8 space-y-4 rounded-3xl bg-white p-6" data-testid="login-form" @submit.prevent="submit">
      <AppInput id="email" v-model="email" label="Email" type="email" />
      <AppInput id="password" v-model="password" label="Пароль" type="password" />
      <p v-if="error" class="text-sm text-danger" role="alert">{{ error }}</p>
      <AppButton type="submit" :disabled="pending" data-testid="login-submit">Войти</AppButton>
    </form>
    <ul class="mt-6 space-y-2 text-sm">
      <li v-for="item in accounts" :key="item.email">
        <button type="button" class="text-left hover:underline" @click="email = item.email">
          {{ item.role }}: {{ item.email }}
        </button>
      </li>
    </ul>
  </div>
</template>
