#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const source = path.resolve(__dirname, '..', '..', 'dist', 'public');
const destination = path.resolve(__dirname, '..', 'dist', 'public');

if (!fs.existsSync(source)) {
  console.error(`Source assets not found at ${source}. Have you run the renderer build?`);
  process.exit(1);
}

fs.rmSync(destination, { recursive: true, force: true });
fs.mkdirSync(destination, { recursive: true });

fs.cpSync(source, destination, { recursive: true });
