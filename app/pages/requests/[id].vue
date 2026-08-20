<script setup lang="ts">
import type { PublicUser, RequestDetails, RequestPriority, RequestStatus } from '#shared/types/domain'
import { REQUEST_PRIORITIES } from '#shared/types/domain'
import { PRIORITY_LABELS, requestNumber } from '#shared/utils/labels'
import { ALLOWED_TRANSITIONS } from '#shared/utils/transitions'
import { adaptRequest } from '~/utils/format'

definePageMeta({ middleware: 'auth', title: 'Карточка заявки' })
const route = useRoute()
const { user } = useAuth()
const mutations = useRequestMutations()
const reason = ref('')
const resolutionText = ref('')
const selectedAssignee = ref('')
const localError = ref('')

const { data, pending, error, refresh } = await useAsyncData(
  () => `request-${route.params.id}`,
  () => $fetch<{ request: RequestDetails }>(`/api/requests/${route.params.id}`)
)
const { data: usersData } = await useAsyncData('assignable-users', () => $fetch<{ users: PublicUser[] }>('/api/users', { query: { role: 'agent' } }))

const request = computed(() => data.value?.request ? adaptRequest(data.value.request) as RequestDetails : null)
if (error.value && (error.value as { statusCode?: number }).statusCode === 404) {
  throw createError({ statusCode: 404, statusMessage: 'Заявка не найдена' })
}

const nextStatuses = computed(() => request.value ? ALLOWED_TRANSITIONS[request.value.status] : [])
const canOperate = computed(() => user.value?.role === 'operator' || user.value?.role === 'admin')
const canWork = computed(() => user.value?.role === 'agent' || canOperate.value)
const canClose = computed(() => user.value?.role === 'client' || canOperate.value)

async function setPriority(priority: RequestPriority) {
  if (!request.value) return
  localError.value = ''
  try {
    await mutations.changePriority(request.value, priority)
    await refresh()
  } catch (err) {
    localError.value = useApiError().messageOf(err)
    await refresh()
  }
}

async function go(to: RequestStatus) {
  if (!request.value) return
  localError.value = ''
  try {
    await mutations.transition(request.value, to, {
      reason: reason.value,
      resolutionText: resolutionText.value,
      assigneeId: selectedAssignee.value || undefined
    })
    reason.value = ''
    await refresh()
  } catch (err) {
    localError.value = useApiError().messageOf(err)
  }
}

async function assign() {
  if (!request.value || !selectedAssignee.value) return
  localError.value = ''
  try {
    const updated = await mutations.patchRequest(request.value.id, {
      assigneeId: selectedAssignee.value,
      version: request.value.version
    })
    Object.assign(request.value, updated)
    await refresh()
  } catch (err) {
    localError.value = useApiError().messageOf(err)
  }
}

async function comment(body: string) {
  if (!request.value) return
  await mutations.addComment(request.value.id, body)
  await refresh()
}

async function upload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !request.value) return
  const form = new FormData()
  form.append('file', file)
  try {
    await $fetch(`/api/requests/${request.value.id}/attachments`, { method: 'POST', body: form })
    await refresh()
  } catch (err) {
    localError.value = useApiError().messageOf(err)
  }
}
</script>

<template>
  <div>
    <SkeletonList v-if="pending && !request" />
    <ErrorState v-else-if="error && !request" title="Не удалось открыть заявку" :text="useApiError().messageOf(error)" @retry="refresh" />
    <div v-else-if="request" class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section class="space-y-4">
        <p class="text-sm text-ink-soft">{{ requestNumber(request.number) }} · {{ request.customer?.company }}</p>
        <h1 class="break-words font-display text-4xl">{{ request.title }}</h1>
        <div class="flex flex-wrap items-center gap-3">
          <StatusBadge :status="request.status" />
          <PriorityBadge :priority="request.priority" />
          <span class="text-sm text-ink-soft">SLA {{ formatDate(request.slaDueAt) }}</span>
        </div>
        <p class="whitespace-pre-wrap rounded-3xl bg-white p-5 leading-relaxed">{{ request.description }}</p>
        <p v-if="localError || mutations.errorMessage" class="text-sm text-danger" role="alert">{{ localError || mutations.errorMessage }}</p>
        <div v-if="canOperate" class="flex flex-wrap gap-2">
          <button
            v-for="item in REQUEST_PRIORITIES"
            :key="item"
            type="button"
            class="rounded-full border border-ink/15 px-3 py-1 text-sm hover:bg-paper-2"
            :class="request.priority === item ? 'bg-ink text-paper' : ''"
            @click="setPriority(item)"
          >
            {{ PRIORITY_LABELS[item] }}
          </button>
        </div>
        <div v-if="canOperate" class="rounded-3xl bg-white p-4 space-y-3">
          <AppSelect id="assignee" v-model="selectedAssignee" label="Исполнитель">
            <option value="">Не выбран</option>
            <option v-for="item in usersData?.users || []" :key="item.id" :value="item.id">{{ item.name }} ({{ item.status }})</option>
          </AppSelect>
          <AppButton :disabled="!selectedAssignee" @click="assign">Назначить</AppButton>
        </div>
        <div class="space-y-2 rounded-3xl bg-white p-4">
          <AppInput id="reason" v-model="reason" label="Причина (ожидание / эскалация / закрытие)" />
          <div>
            <label for="resolution" class="mb-1 block text-sm font-medium">Результат решения</label>
            <textarea id="resolution" v-model="resolutionText" rows="3" class="w-full rounded-xl border border-ink/15 p-3 text-sm" />
          </div>
          <div class="flex flex-wrap gap-2">
            <AppButton v-for="status in nextStatuses" :key="status" :disabled="!canWork && status !== 'closed'" @click="go(status)">
              → {{ status }}
            </AppButton>
            <AppButton v-if="request.status === 'resolved' && canClose" variant="copper" @click="go('closed')">Подтвердить и закрыть</AppButton>
          </div>
        </div>
        <div class="rounded-3xl bg-white p-4">
          <h2 class="mb-3 font-display text-2xl">Комментарии</h2>
          <CommentThread :comments="request.comments" :disabled="request.status === 'closed'" @submit="comment" />
        </div>
      </section>
      <aside class="space-y-4">
        <div class="rounded-3xl bg-white p-4">
          <h2 class="font-display text-2xl">История</h2>
          <RequestTimeline class="mt-4" :events="request.events" />
        </div>
        <div class="rounded-3xl bg-white p-4">
          <h2 class="font-display text-2xl">Вложения</h2>
          <ul class="mt-3 space-y-2 text-sm">
            <li v-for="file in request.attachments" :key="file.id">
              <a :href="file.url" class="text-copper hover:underline">{{ file.filename }}</a>
              <span class="text-ink-soft"> · {{ formatBytes(file.size) }}</span>
            </li>
          </ul>
          <label v-if="request.status !== 'closed'" class="mt-4 block text-sm">
            Добавить файл
            <input type="file" class="mt-1 block w-full text-sm" @change="upload">
          </label>
        </div>
      </aside>
    </div>
  </div>
</template>
