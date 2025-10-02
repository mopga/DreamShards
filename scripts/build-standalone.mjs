#!/usr/bin/env node
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const serverBundle = path.join(distDir, "server", "index.js");
const publicDir = path.join(distDir, "public");
const outputRoot = path.join(rootDir, "standalone", "win-x64");
const outputExe = path.join(outputRoot, "DreamShards.exe");
const pkgTarget = "node18-win-x64";
const sqliteBinary = path.join(rootDir, "node_modules", "better-sqlite3", "build", "Release", "better_sqlite3.node");
const databaseFile = path.join(rootDir, "server", "dreamshards.db");

function run(command) {
  execSync(command, { stdio: "inherit", cwd: rootDir });
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

  if (!fs.existsSync(sqliteBinary)) {
    throw new Error("Could not locate better-sqlite3 native binary. Did you run npm install?");
  }
  fs.copyFileSync(sqliteBinary, path.join(outputRoot, path.basename(sqliteBinary)));
}

function createExecutable() {
  console.log("⚙️  Bundling Windows executable with pkg...");
  const pkgCommand = [
    "npx",
    "pkg",
    serverBundle,
    "--target",
    pkgTarget,
    "--output",
    outputExe,
  ].join(" ");
  run(pkgCommand);
}

function main() {
  ensureBuildArtifacts();
  prepareOutputDirectory();
  copyStaticAssets();
  createExecutable();
  console.log(`✅ Standalone build created at ${outputRoot} (target ${pkgTarget})`);
}

main();
