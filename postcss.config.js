import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const moduleFilename =
  typeof __filename === "string" ? __filename : fileURLToPath(import.meta.url);
const moduleDirname =
  typeof __dirname === "string" ? __dirname : dirname(moduleFilename);

export default {
  plugins: {
    tailwindcss: {
      config: resolve(moduleDirname, "tailwind.config.ts"),
    },
    autoprefixer: {},
  },
};
