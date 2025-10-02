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
const outputRoot = path.join(rootDir, "standalone", "win-x64");
const outputExe = path.join(outputRoot, "DreamShards.exe");
const pkgTarget = "node18-win-x64";
const sqliteBinary = path.join(rootDir, "node_modules", "better-sqlite3", "build", "Release", "better_sqlite3.node");
const pkgNodeVersion = "18.5.0";
let windowsSqliteBinaryBuffer = null;
const pkgConfigFile = path.join(rootDir, "pkg.standalone.json");
const databaseFile = path.join(rootDir, "server", "dreamshards.db");

function run(command) {
  execSync(command, { stdio: "inherit", cwd: rootDir });
}

function runBin(binary, args, options = {}) {
  execFileSync(binary, args, { stdio: "inherit", cwd: options.cwd ?? rootDir });
}

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
    "esbuild",
    path.join("server", "src", "index.ts"),
    "--platform=node",
    "--packages=external",
    "--bundle",
    "--format=cjs",
    `--outfile=${relativeOutput}`,
  ];
  runBin("npx", esbuildArgs);

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

  if (!windowsSqliteBinaryBuffer) {
    throw new Error("better-sqlite3 Windows binary was not prepared.");
  }

  fs.writeFileSync(
    path.join(outputRoot, path.basename(sqliteBinary)),
    windowsSqliteBinaryBuffer,
  );
}

function ensureBetterSqliteBinary() {
  console.log(`⚙️  Ensuring better-sqlite3 native addon for Node ${pkgNodeVersion} (win32-x64)...`);
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
      "npx",
      [
        "prebuild-install",
        "--target",
        pkgNodeVersion,
        "--runtime",
        "node",
        "--platform",
        "win32",
        "--arch",
        "x64",
      ],
      { cwd: moduleDir },
    );

    if (!fs.existsSync(sqliteBinary)) {
      throw new Error("Failed to download better-sqlite3 Windows binary.");
    }

    windowsSqliteBinaryBuffer = fs.readFileSync(sqliteBinary);
  } finally {
    fs.writeFileSync(sqliteBinary, originalBinary);
  }

  if (!windowsSqliteBinaryBuffer || windowsSqliteBinaryBuffer.length === 0) {
    throw new Error("Downloaded better-sqlite3 Windows binary was empty.");
  }
}

function createExecutable() {
  console.log("⚙️  Bundling Windows executable with pkg...");
  if (!fs.existsSync(pkgConfigFile)) {
    throw new Error(`Missing pkg configuration at ${pkgConfigFile}`);
  }

  const pkgArgs = [
    "pkg",
    path.relative(rootDir, serverStandaloneBundle),
    "--target",
    pkgTarget,
    "--output",
    path.relative(rootDir, outputExe),
    "--config",
    path.relative(rootDir, pkgConfigFile),
  ];

  runBin("npx", pkgArgs);
}

function main() {
  ensureBuildArtifacts();
  buildCommonJsServerBundle();
  prepareOutputDirectory();
  ensureBetterSqliteBinary();
  copyStaticAssets();
  createExecutable();
  console.log(`✅ Standalone build created at ${outputRoot} (target ${pkgTarget})`);
}

main();
