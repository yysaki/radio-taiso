import { defineConfig } from 'vite'

export default defineConfig({
  base: '/radio_taiso/',
  oxc: {
    jsx: {
      runtime: 'automatic',
      importSource: 'remix/component',
    },
  },
})
