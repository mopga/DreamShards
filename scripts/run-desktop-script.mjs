import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { runNpmCommand } from './npm-command.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultProjectRoot = resolve(__dirname, '..');

export function runDesktopScript(scriptName, { projectRoot = defaultProjectRoot, npmOptions = [], scriptArgs = [] } = {}) {
  if (!scriptName) {
    return Promise.reject(new Error('A desktop npm script name must be provided.'));
  }

  const commandArgs = ['run', scriptName, '--prefix', 'desktop', ...npmOptions];

  if (scriptArgs.length > 0) {
    commandArgs.push('--', ...scriptArgs);
  }

  return runNpmCommand(commandArgs, {
    cwd: projectRoot,
    displayName: `Desktop script "${scriptName}"`,
  });
}

async function runAsScript() {
  const [, , scriptName, ...rest] = process.argv;

  if (!scriptName) {
    console.error('Usage: node scripts/run-desktop-script.mjs <script> [npm options...] [-- <script args...>]');
    process.exit(1);
  }

  const separatorIndex = rest.indexOf('--');
  const npmOptions = separatorIndex === -1 ? rest : rest.slice(0, separatorIndex);
  const scriptArgs = separatorIndex === -1 ? [] : rest.slice(separatorIndex + 1);

  try {
    await runDesktopScript(scriptName, {
      projectRoot: defaultProjectRoot,
      npmOptions,
      scriptArgs,
    });
  } catch (error) {
    console.error(`Failed to run desktop script "${scriptName}":`, error);
    process.exit(typeof error?.code === 'number' ? error.code : 1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runAsScript();
}
