import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname) },
  },
  // Componentes do editor importam CSS; nos testes não precisa do Tailwind
  // (e o plugin do Tailwind no postcss.config quebra o carregamento do Vite).
  css: { postcss: { plugins: [] } },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/setup.ts"],
    // Cada arquivo sobe o próprio Postgres em memória (PGlite) com o schema.
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
