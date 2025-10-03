import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
import glsl from "vite-plugin-glsl";

const moduleFilename =
  typeof __filename === "string"
    ? __filename
    : fileURLToPath(import.meta.url);
const moduleDirname =
  typeof __dirname === "string" ? __dirname : dirname(moduleFilename);

const isDesktopBuild = process.env.VITE_BUILD_TARGET === "desktop";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    glsl(), // Add GLSL shader support
  ],
  base: isDesktopBuild ? "./" : "/",
  resolve: {
    alias: {
      "@": path.resolve(moduleDirname, "client", "src"),
      "@shared": path.resolve(moduleDirname, "shared"),
    },
  },
  root: path.resolve(moduleDirname, "client"),
  build: {
    outDir: path.resolve(moduleDirname, "dist/public"),
    emptyOutDir: true,
  },
  // Add support for large models and audio files
  assetsInclude: ["**/*.gltf", "**/*.glb", "**/*.mp3", "**/*.ogg", "**/*.wav"],
});
