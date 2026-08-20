<script setup lang="ts">
import type { Comment } from '#shared/types/domain'

const props = defineProps<{ comments: Comment[], disabled?: boolean }>()
const emit = defineEmits<{ submit: [body: string] }>()
const body = ref('')
const sending = ref(false)

async function send() {
  if (sending.value) return
  const text = body.value.trim()
  if (!text) return
  sending.value = true
  try {
    emit('submit', text)
    body.value = ''
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <article v-for="comment in props.comments" :key="comment.id" class="rounded-2xl bg-paper-2/60 p-3">
      <p class="text-sm font-medium">{{ comment.authorName }}</p>
      <p class="whitespace-pre-wrap text-sm">{{ comment.body }}</p>
      <p class="mt-1 text-xs text-ink-soft">{{ formatDate(comment.createdAt) }}</p>
    </article>
    <form class="space-y-2" @submit.prevent="send">
      <label for="comment-body" class="text-sm font-medium">Комментарий</label>
      <textarea id="comment-body" v-model="body" rows="3" class="w-full rounded-2xl border border-ink/15 p-3 text-sm" :disabled="disabled || sending" />
      <AppButton type="submit" :disabled="disabled || sending || !body.trim()">Отправить</AppButton>
    </form>
  </div>
</template>
