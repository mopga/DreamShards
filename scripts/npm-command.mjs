import { spawn } from 'child_process';

function createNpmInvocation(args) {
  const npmExecPath = process.env.npm_execpath;

  if (npmExecPath?.endsWith('.js')) {
    return {
      command: process.execPath,
      args: [npmExecPath, ...args],
    };
  }

  if (process.platform === 'win32') {
    return {
      command: 'npm.cmd',
      args,
    };
  }

  return {
    command: 'npm',
    args,
  };
}


export function runNpmCommand(
  args,
  { cwd = process.cwd(), stdio = 'inherit', displayName, env = process.env } = {}
) {
  const label = displayName ?? `npm ${args.join(' ')}`;

  return new Promise((resolve, reject) => {
    const { command, args: commandArgs } = createNpmInvocation(args);

    const child = spawn(command, commandArgs, {
      cwd,
      stdio,
      env,
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('exit', (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      const reason = signal ? `terminated with signal ${signal}` : `exited with code ${code}`;
      const error = new Error(`${label} ${reason}.`);

      if (typeof code === 'number') {
        error.code = code;
      }

      if (signal) {
        error.signal = signal;
      }

      reject(error);
    });
  });
}
