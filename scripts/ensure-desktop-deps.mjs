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

  const toExtendedLengthPath = (targetPath) => {
    const normalizedPath = targetPath.replace(/\//g, '\\');

    if (normalizedPath.startsWith('\\\\?\\')) {
      return normalizedPath;
    }

    return `\\\\?\\${normalizedPath}`;
  };

  const removeWithRmSync = (targetPath, { useExtendedPath = false } = {}) => {
    const removalTarget = useExtendedPath && process.platform === 'win32'
      ? toExtendedLengthPath(targetPath)
      : targetPath;

    rmSync(removalTarget, {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 100,
    });
  };

  const escapeForPowerShell = (value) =>
    value.replace(/`/g, '``').replace(/\$/g, '`$').replace(/"/g, '`"');

  const closeWindowsLockingProcesses = (targetPath) => {
    if (process.platform !== 'win32') {
      return;
    }

    const normalizedTarget = escapeForPowerShell(targetPath);
    const script = `
$ErrorActionPreference = "SilentlyContinue"
$target = "${normalizedTarget}"
$normalized = [System.IO.Path]::GetFullPath($target)
$lockingProcesses = Get-Process | ForEach-Object {
  $proc = $_
  try {
    $modules = $proc.Modules
    if ($modules) {
      foreach ($module in $modules) {
        $modulePath = $module.FileName
        if ($modulePath -and $modulePath.StartsWith($normalized, [System.StringComparison]::OrdinalIgnoreCase)) {
          return $proc
        }
      }
    }
  } catch {
  }
} | Where-Object { $_ -ne $null } | Sort-Object Id -Unique

foreach ($proc in $lockingProcesses) {
  try {
    Write-Output "Stopping process $($proc.ProcessName) (PID $($proc.Id)) locking $normalized"
    Stop-Process -Id $proc.Id -Force -ErrorAction Stop
  } catch {
    Write-Output "Failed to stop process $($proc.ProcessName) (PID $($proc.Id)): $_"
  }
}`;

    try {
      spawnSync('powershell.exe', ['-NoLogo', '-NoProfile', '-Command', script], {
        stdio: 'inherit',
      });
    } catch (powerShellError) {
      console.warn('Failed to terminate Windows processes locking desktop node_modules:', powerShellError);
    }
  };

  const tryWindowsFallback = (targetPath, { useExtendedPath = false } = {}) => {
    if (process.platform !== 'win32') {
      return;
    }

    const fallbackTarget = useExtendedPath ? toExtendedLengthPath(targetPath) : targetPath;
    const command = 'cmd.exe';
    const args = ['/d', '/s', '/c', `rmdir /s /q "${fallbackTarget}"`];

    spawnSync(command, args, { stdio: 'inherit' });
  };

  const tryRemovingTarget = (targetPath) => {
    try {
      removeWithRmSync(targetPath);
      if (!existsSync(targetPath)) {
        return true;
      }
    } catch (error) {
      console.warn(`Failed to remove ${targetPath} with rmSync. Trying fallback...`, error);
    }

    if (process.platform === 'win32') {
      closeWindowsLockingProcesses(targetPath);

      try {
        removeWithRmSync(targetPath, { useExtendedPath: true });
        if (!existsSync(targetPath)) {
          return true;
        }
      } catch (extendedError) {
        console.warn(`Failed to remove ${targetPath} with extended path rmSync.`, extendedError);
      }

      tryWindowsFallback(targetPath);
      if (!existsSync(targetPath)) {
        return true;
      }

      tryWindowsFallback(targetPath, { useExtendedPath: true });
      if (!existsSync(targetPath)) {
        return true;
      }
    }

    try {
      removeWithRmSync(targetPath);
    } catch (finalError) {
      console.warn(`Final attempt to remove ${targetPath} failed.`, finalError);
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

  try {
    let primaryRemovalSucceeded = true;

    for (let i = 0; i < removalTargets.length; i += 1) {
      const targetPath = removalTargets[i];
      const removalSucceeded = ensureRemoval(targetPath);

      if (!removalSucceeded && existsSync(targetPath)) {
        if (targetPath === desktopNodeModules) {
          primaryRemovalSucceeded = false;
        }

        console.warn(
          `Desktop node_modules directory still exists at ${targetPath} after cleanup attempts. Desktop dependency installation may fail.`
        );
      }
    }

    if (!primaryRemovalSucceeded && existsSync(desktopNodeModules)) {
      throw new Error(
        'Unable to remove desktop node_modules directory. Close applications that may be using the folder and run the bootstrap again.'
      );
    }
  } catch (cleanupError) {
    console.error('Failed to clean up desktop node_modules before reinstalling:', cleanupError);
    process.exit(1);
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
