import { existsSync, rmSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const desktopDir = resolve(projectRoot, 'desktop');
const binName = process.platform === 'win32' ? 'concurrently.cmd' : 'concurrently';
const desktopNodeModules = resolve(desktopDir, 'node_modules');
const concurrentlyBin = resolve(desktopNodeModules, '.bin', binName);

if (existsSync(concurrentlyBin)) {
  process.exit(0);
}

console.log('Desktop dependencies not found. Installing desktop workspace...');

if (existsSync(desktopNodeModules)) {
  try {
    console.log('Removing stale desktop node_modules directory...');
    rmSync(desktopNodeModules, { recursive: true, force: true, maxRetries: 3 });
  } catch (error) {
    console.warn('Failed to remove desktop node_modules before reinstalling:', error);
  }
}

const npmExecPath = process.env.npm_execpath;
let command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
let args = ['install', '--prefix', 'desktop', '--production=false'];

if (npmExecPath?.endsWith('.js')) {
  command = process.execPath;
  args = [npmExecPath, ...args];
}

const install = spawn(command, args, {
  cwd: projectRoot,
  stdio: 'inherit',
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
