<script setup lang="ts">
definePageMeta({ layout: 'public', middleware: 'guest' })
useSeoMeta({ title: 'Регистрация — WorkFlow', description: 'Создайте клиентский аккаунт WorkFlow.' })

const name = ref('')
const email = ref('')
const password = ref('')
const company = ref('')
const error = ref('')
const pending = ref(false)
const { register } = useAuth()

async function submit() {
  pending.value = true
  error.value = ''
  try {
    await register({ name: name.value, email: email.value, password: password.value, company: company.value })
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
    <h1 class="font-display text-4xl">Регистрация клиента</h1>
    <form class="mt-8 space-y-4 rounded-3xl bg-white p-6" @submit.prevent="submit">
      <AppInput id="name" v-model="name" label="Имя" />
      <AppInput id="company" v-model="company" label="Компания" />
      <AppInput id="email" v-model="email" label="Email" type="email" />
      <AppInput id="password" v-model="password" label="Пароль" type="password" />
      <p v-if="error" class="text-sm text-danger" role="alert">{{ error }}</p>
      <AppButton type="submit" :disabled="pending">Создать аккаунт</AppButton>
    </form>
  </div>
</template>
