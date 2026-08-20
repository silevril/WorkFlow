import { defineStore } from 'pinia'

interface UndoEntry {
  label: string
  run: () => Promise<void>
}

export const useUndoStore = defineStore('undo', {
  state: (): { entry: UndoEntry | null } => ({ entry: null }),
  actions: {
    set(entry: UndoEntry) {
      this.entry = entry
    },
    async undo() {
      const current = this.entry
      this.entry = null
      if (current) await current.run()
    },
    clear() {
      this.entry = null
    }
  }
})
