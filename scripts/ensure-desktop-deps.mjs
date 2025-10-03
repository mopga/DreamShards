import { existsSync, renameSync, rmSync } from 'fs';
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
  const removalTargets = [desktopNodeModules];

  const removeWithRmSync = (targetPath) => {
    rmSync(targetPath, {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 100,
    });
  };

  const tryWindowsFallback = (targetPath) => {
    if (process.platform !== 'win32') {
      return;
    }

    const command = 'cmd.exe';
    const args = ['/d', '/s', '/c', `rmdir /s /q "${targetPath}"`];

    spawnSync(command, args, { stdio: 'inherit' });
  };

  const tryRemovingTarget = (targetPath) => {
    try {
      removeWithRmSync(targetPath);
    } catch (error) {
      console.warn(`Failed to remove ${targetPath} with rmSync. Trying fallback...`, error);

      try {
        tryWindowsFallback(targetPath);

        if (existsSync(targetPath)) {
          // Retry with rmSync in case the fallback cleared the offending files.
          removeWithRmSync(targetPath);
        }
      } catch (fallbackError) {
        console.warn(`Fallback removal of ${targetPath} failed:`, fallbackError);
      }
    }

    return !existsSync(targetPath);
  };

  const ensureRemoval = (targetPath) => {
    if (tryRemovingTarget(targetPath)) {
      return true;
    }

    if (targetPath !== desktopNodeModules) {
      return false;
    }

    const renamedTarget = `${desktopNodeModules}.stale-${Date.now()}`;

    try {
      renameSync(desktopNodeModules, renamedTarget);
      removalTargets.push(renamedTarget);
      console.warn(
        `Renamed stubborn desktop node_modules directory to ${renamedTarget} before retrying removal.`
      );
      return tryRemovingTarget(renamedTarget);
    } catch (renameError) {
      console.warn('Failed to rename desktop node_modules directory for cleanup:', renameError);
      return false;
    }
  };

  console.log('Removing stale desktop node_modules directory...');

  for (let i = 0; i < removalTargets.length; i += 1) {
    const targetPath = removalTargets[i];

    if (!ensureRemoval(targetPath) && existsSync(targetPath)) {
      console.warn(
        `Desktop node_modules directory still exists at ${targetPath} after cleanup attempts. Desktop dependency installation may fail.`
      );
    }
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
