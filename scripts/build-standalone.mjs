#!/usr/bin/env node
import { execSync, execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const serverBundle = path.join(distDir, "server", "index.js");
const serverStandaloneBundle = path.join(distDir, "server", "index.cjs");
const publicDir = path.join(distDir, "public");
const pkgNodeVersion = "18.5.0";
const sqliteBinary = path.join(
  rootDir,
  "node_modules",
  "better-sqlite3",
  "build",
  "Release",
  "better_sqlite3.node",
);

const PLATFORM_ALIASES = new Map([
  ["win", "win32"],
  ["windows", "win32"],
  ["win32", "win32"],
  ["linux", "linux"],
  ["darwin", "darwin"],
  ["mac", "darwin"],
  ["macos", "darwin"],
  ["osx", "darwin"],
]);

const ARCH_ALIASES = new Map([
  ["x64", "x64"],
  ["amd64", "x64"],
  ["arm64", "arm64"],
  ["aarch64", "arm64"],
]);

const SUPPORTED_PLATFORMS = {
  win32: {
    label: "win",
    pkgPlatform: "win",
    prebuildPlatform: "win32",
    executableSuffix: ".exe",
  },
  linux: {
    label: "linux",
    pkgPlatform: "linux",
    prebuildPlatform: "linux",
    executableSuffix: "",
  },
  darwin: {
    label: "macos",
    pkgPlatform: "macos",
    prebuildPlatform: "darwin",
    executableSuffix: "",
  },
};

function normalizePlatform(value) {
  const normalized = PLATFORM_ALIASES.get(value.toLowerCase()) ?? value.toLowerCase();
  if (!(normalized in SUPPORTED_PLATFORMS)) {
    throw new Error(
      `Unsupported target platform "${value}". Supported platforms: ${Object.keys(SUPPORTED_PLATFORMS).join(", ")}.`,
    );
  }
  return normalized;
}

function normalizeArch(value) {
  const normalized = ARCH_ALIASES.get(value.toLowerCase()) ?? value.toLowerCase();
  if (!["x64", "arm64"].includes(normalized)) {
    throw new Error('Unsupported target architecture "' + value + '". Supported architectures: x64, arm64.');
  }
  return normalized;
}

function parseTargetSpecifier(specifier) {
  const [platformPart, archPart] = specifier.split("-");
  if (!platformPart || !archPart) {
    throw new Error(`Invalid target specifier "${specifier}". Expected format <platform>-<arch>, e.g. win-x64.`);
  }
  return {
    platform: normalizePlatform(platformPart),
    arch: normalizeArch(archPart),
  };
}

const args = process.argv.slice(2);
let overridePlatform;
let overrideArch;

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];

  if (arg.startsWith("--target=")) {
    const { platform, arch } = parseTargetSpecifier(arg.split("=", 2)[1]);
    overridePlatform = platform;
    overrideArch = arch;
    continue;
  }

  if (arg === "--target") {
    if (i + 1 >= args.length) {
      throw new Error("--target requires a value (e.g. --target win-x64)");
    }
    const { platform, arch } = parseTargetSpecifier(args[i + 1]);
    overridePlatform = platform;
    overrideArch = arch;
    i += 1;
    continue;
  }

  if (arg.startsWith("--platform=")) {
    overridePlatform = normalizePlatform(arg.split("=", 2)[1]);
    continue;
  }

  if (arg === "--platform") {
    if (i + 1 >= args.length) {
      throw new Error("--platform requires a value");
    }
    overridePlatform = normalizePlatform(args[i + 1]);
    i += 1;
    continue;
  }

  if (arg.startsWith("--arch=")) {
    overrideArch = normalizeArch(arg.split("=", 2)[1]);
    continue;
  }

  if (arg === "--arch") {
    if (i + 1 >= args.length) {
      throw new Error("--arch requires a value");
    }
    overrideArch = normalizeArch(args[i + 1]);
    i += 1;
    continue;
  }

  throw new Error(`Unknown argument "${arg}".`);
}

const targetPlatform = overridePlatform ?? normalizePlatform(process.platform);
const targetArch = overrideArch ?? normalizeArch(process.arch);
const platformConfig = SUPPORTED_PLATFORMS[targetPlatform];
const pkgArch = targetArch;
const pkgTarget = `node18-${platformConfig.pkgPlatform}-${pkgArch}`;
const outputLabel = `${platformConfig.label}-${targetArch}`;
const outputRoot = path.join(rootDir, "standalone", outputLabel);
const outputExe = path.join(outputRoot, `DreamShards${platformConfig.executableSuffix}`);

let targetSqliteBinaryBuffer = null;
const pkgConfigFile = path.join(rootDir, "pkg.standalone.json");
const databaseFile = path.join(rootDir, "server", "dreamshards.db");

function run(command) {
  execSync(command, { stdio: "inherit", cwd: rootDir });
}

function runBin(binary, args, options = {}) {
  execFileSync(binary, args, { stdio: "inherit", cwd: options.cwd ?? rootDir });
}

const binExt = process.platform === "win32" ? ".cmd" : "";

function resolveBin(name, options = {}) {
  const binPath = path.join(rootDir, "node_modules", ".bin", `${name}${binExt}`);

  if (!fs.existsSync(binPath)) {
    const installCommand = options.installCommand ?? "npm install";
    throw new Error(
      `Required binary "${name}" was not found at ${binPath}. Did you run ${installCommand}?`,
    );
  }

  return binPath;
}

const esbuildBin = resolveBin("esbuild");
const prebuildInstallBin = resolveBin("prebuild-install", { installCommand: "npm install" });
const pkgBin = resolveBin("pkg", { installCommand: "npm install --save-dev pkg" });

function ensureBuildArtifacts() {
  const hasServer = fs.existsSync(serverBundle);
  const hasPublic = fs.existsSync(publicDir);

  if (hasServer && hasPublic) {
    return;
  }

  console.log("⚙️  Running production build (npm run build)...");
  run("npm run build");

  if (!fs.existsSync(serverBundle) || !fs.existsSync(publicDir)) {
    throw new Error("Build artifacts were not produced. Check the build output for details.");
  }
}

function buildCommonJsServerBundle() {
  console.log("⚙️  Creating CommonJS server bundle for pkg...");
  const relativeOutput = path.relative(rootDir, serverStandaloneBundle);
  const esbuildArgs = [
    path.join("server", "src", "index.ts"),
    "--platform=node",
    "--packages=external",
    "--bundle",
    "--format=cjs",
    `--outfile=${relativeOutput}`,
  ];
  runBin(esbuildBin, esbuildArgs);

  if (!fs.existsSync(serverStandaloneBundle)) {
    throw new Error("Failed to create CommonJS server bundle for pkg.");
  }
}

function prepareOutputDirectory() {
  if (fs.existsSync(outputRoot)) {
    fs.rmSync(outputRoot, { recursive: true, force: true });
  }
  fs.mkdirSync(outputRoot, { recursive: true });
}

function copyStaticAssets() {
  const targetPublicDir = path.join(outputRoot, "public");
  fs.cpSync(publicDir, targetPublicDir, { recursive: true });

  if (fs.existsSync(databaseFile)) {
    const targetDbDir = path.join(outputRoot, "server");
    fs.mkdirSync(targetDbDir, { recursive: true });
    fs.copyFileSync(databaseFile, path.join(targetDbDir, path.basename(databaseFile)));
  }

  if (!targetSqliteBinaryBuffer) {
    throw new Error("better-sqlite3 binary for the target platform was not prepared.");
  }

  fs.writeFileSync(
    path.join(outputRoot, path.basename(sqliteBinary)),
    targetSqliteBinaryBuffer,
  );
}

function ensureBetterSqliteBinary() {
  console.log(
    `⚙️  Ensuring better-sqlite3 native addon for Node ${pkgNodeVersion} (${platformConfig.prebuildPlatform}-${targetArch})...`,
  );
  const moduleDir = path.join(rootDir, "node_modules", "better-sqlite3");

  if (!fs.existsSync(moduleDir)) {
    throw new Error("better-sqlite3 is not installed. Did you run npm install?");
  }

  if (!fs.existsSync(sqliteBinary)) {
    throw new Error("Could not locate better-sqlite3 native binary. Did you run npm install?");
  }

  const originalBinary = fs.readFileSync(sqliteBinary);

  try {
    runBin(
      prebuildInstallBin,
      [
        "--target",
        pkgNodeVersion,
        "--runtime",
        "node",
        "--platform",
        platformConfig.prebuildPlatform,
        "--arch",
        targetArch,
      ],
      { cwd: moduleDir },
    );

    if (!fs.existsSync(sqliteBinary)) {
      throw new Error("Failed to download better-sqlite3 native binary for the target platform.");
    }

    targetSqliteBinaryBuffer = fs.readFileSync(sqliteBinary);
  } finally {
    fs.writeFileSync(sqliteBinary, originalBinary);
  }

  if (!targetSqliteBinaryBuffer || targetSqliteBinaryBuffer.length === 0) {
    throw new Error("Downloaded better-sqlite3 native binary was empty.");
  }
}

function createExecutable() {
  console.log(`⚙️  Bundling ${platformConfig.label} executable with pkg...`);
  if (!fs.existsSync(pkgConfigFile)) {
    throw new Error(`Missing pkg configuration at ${pkgConfigFile}`);
  }

  const pkgArgs = [
    path.relative(rootDir, serverStandaloneBundle),
    "--target",
    pkgTarget,
    "--output",
    path.relative(rootDir, outputExe),
    "--config",
    path.relative(rootDir, pkgConfigFile),
  ];

  runBin(pkgBin, pkgArgs);
}

function main() {
  console.log(`🎯 Targeting ${targetPlatform}/${targetArch} (pkg target ${pkgTarget})`);
  ensureBuildArtifacts();
  buildCommonJsServerBundle();
  prepareOutputDirectory();
  ensureBetterSqliteBinary();
  copyStaticAssets();
  createExecutable();
  console.log(`✅ Standalone build created at ${outputRoot} (target ${pkgTarget})`);
}

main();
