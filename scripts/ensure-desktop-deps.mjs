import { existsSync, rmSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import { installDesktopDependencies } from './install-desktop-deps.mjs';

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
  const removeWithRmSync = () => {
    rmSync(desktopNodeModules, {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 100,
    });
  };

  const tryWindowsFallback = () => {
    if (process.platform !== 'win32') {
      return;
    }

    const command = 'cmd.exe';
    const args = ['/d', '/s', '/c', `rmdir /s /q "${desktopNodeModules}"`];

    spawnSync(command, args, { stdio: 'inherit' });
  };

  try {
    console.log('Removing stale desktop node_modules directory...');
    removeWithRmSync();
  } catch (error) {
    console.warn('Failed to remove desktop node_modules with rmSync. Trying fallback...', error);

    try {
      tryWindowsFallback();

      if (existsSync(desktopNodeModules)) {
        // Retry with rmSync in case the fallback cleared the offending files.
        removeWithRmSync();
      }
    } catch (fallbackError) {
      console.warn('Fallback removal of desktop node_modules failed:', fallbackError);
    }
  }

  if (existsSync(desktopNodeModules)) {
    console.warn(
      'Desktop node_modules directory still exists after cleanup attempts. Desktop dependency installation may fail.'
    );
  }
}

try {
  await installDesktopDependencies({ projectRoot });
  console.log('Desktop dependencies installed successfully.');
  process.exit(0);
} catch (error) {
  console.error('Failed to install desktop dependencies:', error);
  process.exit(typeof error?.code === 'number' ? error.code : 1);
}
