// env.d.ts

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Explicit declaration for App.vue if needed
declare module '@/views/App.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Additional modules if necessary, e.g., for GlowingGlobe.js
declare module '@/utils/GlowingGlobe' {
  export function initGlowingGlobe(container: HTMLElement): void
}