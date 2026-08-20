<script setup lang="ts">
definePageMeta({ layout: 'public' })
useSeoMeta({
  title: 'WorkFlow — сервисные заявки без почтового хаоса',
  description: 'Клиент создаёт заявку, оператор назначает исполнителя, инженер ведёт работу, SLA видно сразу.',
  ogTitle: 'WorkFlow',
  ogDescription: 'Веб-приложение для управления сервисными заявками.',
  ogType: 'website'
})
useHead({
  link: [{ rel: 'canonical', href: 'http://localhost:3000/' }]
})
</script>

<template>
  <div>
    <section class="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <p class="text-sm uppercase tracking-[0.2em] text-copper">НордСервис · корпоративный контур</p>
      <h1 class="mt-4 max-w-3xl font-display text-5xl leading-none md:text-7xl">
        Заявки, сроки и ответственность — в одном контуре.
      </h1>
      <p class="mt-6 max-w-2xl text-lg text-ink-soft">
        WorkFlow заменяет переписку в почте и мессенджерах: клиент фиксирует проблему, оператор назначает инженера, статус и SLA не теряются.
      </p>
      <div class="mt-8 flex flex-wrap gap-3">
        <NuxtLink to="/register" class="rounded-full bg-copper px-5 py-3 text-sm text-white hover:bg-copper-dark">Начать как клиент</NuxtLink>
        <NuxtLink to="/login" class="rounded-full border border-ink/15 px-5 py-3 text-sm hover:bg-paper-2">Войти в консоль</NuxtLink>
      </div>
    </section>
    <section class="mx-auto grid max-w-6xl gap-4 px-4 pb-20 md:grid-cols-3">
      <article class="rounded-3xl bg-white p-6">
        <h2 class="font-display text-2xl">Роли без дыр</h2>
        <p class="mt-2 text-ink-soft">Клиент, оператор, исполнитель и администратор. Права проверяются на сервере, не только скрытием кнопок.</p>
      </article>
      <article class="rounded-3xl bg-white p-6">
        <h2 class="font-display text-2xl">SLA на приоритете</h2>
        <p class="mt-2 text-ink-soft">Critical — час, Low — трое суток. Политики редактируются в админке без переписывания кода.</p>
      </article>
      <article class="rounded-3xl bg-white p-6">
        <h2 class="font-display text-2xl">История заявки</h2>
        <p class="mt-2 text-ink-soft">Комментарии, вложения, переходы статусов и эскалации собираются в timeline.</p>
      </article>
    </section>
  </div>
</template>
