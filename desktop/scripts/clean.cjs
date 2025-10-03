#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const targets = [
  path.resolve(__dirname, '..', '..', 'dist', 'desktop'),
  path.resolve(__dirname, '..', 'dist'),
  path.resolve(__dirname, '..', 'tsconfig.main.tsbuildinfo'),
  path.resolve(__dirname, '..', 'tsconfig.preload.tsbuildinfo')
];

for (const target of targets) {
  try {
    fs.rmSync(target, { recursive: true, force: true });
  } catch (error) {
    console.error(`Failed to remove ${target}:`, error);
    process.exitCode = 1;
  }
}
