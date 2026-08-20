<script setup lang="ts">
import type { PublicUser, UserRole, UserStatus } from '#shared/types/domain'

definePageMeta({ middleware: 'admin', title: 'Пользователи' })
const { data, refresh } = await useAsyncData('admin-users', () => $fetch<{ users: PublicUser[] }>('/api/admin/users'))

async function patch(user: PublicUser, field: 'role' | 'status', value: string) {
  await $fetch(`/api/admin/users/${user.id}`, { method: 'PATCH', body: { [field]: value } })
  await refresh()
}
</script>

<template>
  <div class="space-y-4">
    <h1 class="font-display text-4xl">Пользователи</h1>
    <div class="overflow-x-auto rounded-3xl bg-white">
      <table class="min-w-full text-left text-sm">
        <thead>
          <tr class="border-b border-ink/10">
            <th class="p-3">Имя</th>
            <th class="p-3">Email</th>
            <th class="p-3">Роль</th>
            <th class="p-3">Статус</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in data?.users || []" :key="item.id" class="border-b border-ink/5">
            <td class="p-3">{{ item.name }}</td>
            <td class="p-3">{{ item.email }}</td>
            <td class="p-3">
              <select :value="item.role" @change="patch(item, 'role', ($event.target as HTMLSelectElement).value as UserRole)">
                <option value="client">client</option>
                <option value="operator">operator</option>
                <option value="agent">agent</option>
                <option value="admin">admin</option>
              </select>
            </td>
            <td class="p-3">
              <select :value="item.status" @change="patch(item, 'status', ($event.target as HTMLSelectElement).value as UserStatus)">
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
