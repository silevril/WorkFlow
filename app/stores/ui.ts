import { defineStore } from 'pinia'

interface UiState {
  sidebarCollapsed: boolean
  density: 'comfortable' | 'compact'
  lastUndoLabel: string | null
}

export const useUiStore = defineStore('ui', {
  state: (): UiState => ({
    sidebarCollapsed: false,
    density: 'comfortable',
    lastUndoLabel: null
  }),
  actions: {
    hydrate() {
      if (!import.meta.client) return
      const raw = localStorage.getItem('wf-ui')
      if (!raw) return
      try {
        const parsed = JSON.parse(raw) as Partial<UiState>
        if (typeof parsed.sidebarCollapsed === 'boolean') this.sidebarCollapsed = parsed.sidebarCollapsed
        if (parsed.density === 'compact' || parsed.density === 'comfortable') this.density = parsed.density
      } catch {
        localStorage.removeItem('wf-ui')
      }
    },
    persist() {
      if (!import.meta.client) return
      localStorage.setItem('wf-ui', JSON.stringify({
        sidebarCollapsed: this.sidebarCollapsed,
        density: this.density
      }))
    },
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
      this.persist()
    },
    setDensity(density: UiState['density']) {
      this.density = density
      this.persist()
    }
  }
})
