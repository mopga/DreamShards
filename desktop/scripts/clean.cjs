#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const target = path.resolve(__dirname, '..', '..', 'dist', 'desktop');

try {
  fs.rmSync(target, { recursive: true, force: true });
  process.exit(0);
} catch (error) {
  console.error(`Failed to remove ${target}:`, error);
  process.exitCode = 1;
}
