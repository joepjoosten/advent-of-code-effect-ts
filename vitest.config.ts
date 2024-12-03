import { defineConfig } from "vite"
import type { ViteUserConfig } from "vitest/config"

export default defineConfig({
  esbuild: {
    target: "es2020"
  },
  test: {
    include: ["**/*.spec.ts"],
    globals: true
  },
  resolve: {
    alias: {}
  }
} as ViteUserConfig)
