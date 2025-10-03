import baseConfig from "./client/tailwind.config";
import type { Config } from "tailwindcss";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const moduleFilename =
  typeof __filename === "string" ? __filename : fileURLToPath(import.meta.url);
const moduleDirname =
  typeof __dirname === "string" ? __dirname : dirname(moduleFilename);

const contentGlobs = (baseConfig.content ?? [])
  .map((glob) => {
    if (typeof glob !== "string") {
      return glob;
    }

    if (glob.startsWith("./")) {
      return resolve(moduleDirname, "client", glob.slice(2));
    }

    return resolve(moduleDirname, "client", glob);
  });

const config: Config = {
  ...baseConfig,
  content: contentGlobs,
};

export default config;
