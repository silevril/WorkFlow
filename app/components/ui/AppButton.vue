<script setup lang="ts">
withDefaults(defineProps<{
  type?: 'button' | 'submit'
  variant?: 'primary' | 'ghost' | 'danger' | 'copper'
  disabled?: boolean
}>(), {
  type: 'button',
  variant: 'primary',
  disabled: false
})

const classes: Record<string, string> = {
  primary: 'bg-ink text-paper hover:bg-ink-soft',
  ghost: 'border border-ink/15 bg-transparent hover:bg-paper-2',
  danger: 'bg-danger text-white hover:opacity-90',
  copper: 'bg-copper text-white hover:bg-copper-dark'
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
    :class="classes[variant]"
  >
    <slot />
  </button>
</template>
