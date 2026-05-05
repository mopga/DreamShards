import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const moduleFilename = typeof __filename === "string" ? __filename : fileURLToPath(import.meta.url);
const moduleDirname = typeof __dirname === "string" ? __dirname : dirname(moduleFilename);

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "node",
    include: ["client/**/*.test.ts", "client/**/*.test.tsx"],
  },
  resolve: {
    alias: {
      "@": path.resolve(moduleDirname, "client", "src"),
      "@shared": path.resolve(moduleDirname, "shared"),
    },
  },
});
