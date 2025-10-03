import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { runNpmCommand } from './npm-command.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultProjectRoot = resolve(__dirname, '..');
const SKIP_DESKTOP_BOOTSTRAP_ENV = 'DREAM_SHARDS_SKIP_DESKTOP_BOOTSTRAP';
const INSTALL_ARGS = ['install', '--production=false'];

export function installDesktopDependencies({ projectRoot = defaultProjectRoot } = {}) {
  const desktopDir = resolve(projectRoot, 'desktop');

  return runNpmCommand(INSTALL_ARGS, {
    cwd: desktopDir,
    displayName: 'Desktop dependency installation',
    env: {
      ...process.env,
      [SKIP_DESKTOP_BOOTSTRAP_ENV]: '1',
    },
  });
}

async function runAsScript() {
  if (process.env[SKIP_DESKTOP_BOOTSTRAP_ENV] === '1') {
    console.log('Skipping desktop dependency installation (recursion guard active).');
    return;
  }

  try {
    await installDesktopDependencies({ projectRoot: defaultProjectRoot });
  } catch (error) {
    console.error('Failed to install desktop dependencies:', error);
    process.exit(typeof error?.code === 'number' ? error.code : 1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runAsScript();
}
