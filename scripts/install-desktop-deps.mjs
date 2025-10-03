import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { runNpmCommand } from './npm-command.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultProjectRoot = resolve(__dirname, '..');

const INSTALL_ARGS = ['install', '--prefix', 'desktop', '--production=false'];

export function installDesktopDependencies({ projectRoot = defaultProjectRoot } = {}) {
  return runNpmCommand(INSTALL_ARGS, {
    cwd: projectRoot,
    displayName: 'Desktop dependency installation',
  });
}

async function runAsScript() {
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
