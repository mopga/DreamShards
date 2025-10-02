import { existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const desktopDir = resolve(projectRoot, 'desktop');
const binName = process.platform === 'win32' ? 'concurrently.cmd' : 'concurrently';
const concurrentlyBin = resolve(desktopDir, 'node_modules', '.bin', binName);

if (existsSync(concurrentlyBin)) {
  process.exit(0);
}

console.log('Desktop dependencies not found. Installing desktop workspace...');

const install = spawn('npm', ['install', '--prefix', 'desktop', '--production=false'], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

install.on('error', (error) => {
  console.error('Failed to install desktop dependencies:', error);
  process.exit(1);
});

install.on('exit', (code) => {
  if (code === 0) {
    console.log('Desktop dependencies installed successfully.');
    process.exit(0);
  }

  console.error(`Desktop dependency installation exited with code ${code}.`);
  process.exit(code ?? 1);
});
