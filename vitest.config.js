import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    coverage: {
      provider: "v8",
      all: true,
      include: ["src/**/*.js"],
      lines: 100,
      statements: 100,
      branches: 100,
      functions: 100,
    },
  },
});
