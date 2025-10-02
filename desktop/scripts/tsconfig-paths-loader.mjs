import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve as resolvePath } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { createMatchPath } from 'tsconfig-paths';

const desktopDirUrl = new URL('..', import.meta.url);
const projectRootUrl = new URL('../..', import.meta.url);

if (!process.env.TS_NODE_PROJECT) {
  process.env.TS_NODE_PROJECT = fileURLToPath(new URL('tsconfig.main.json', desktopDirUrl));
}

const tsNode = await import('ts-node/esm');

let matchPath;
try {
  const tsConfigPath = fileURLToPath(new URL('tsconfig.base.json', projectRootUrl));
  const tsConfigRaw = await readFile(tsConfigPath, 'utf8');
  const tsConfig = JSON.parse(tsConfigRaw);
  const compilerOptions = tsConfig.compilerOptions ?? {};
  const baseUrl = compilerOptions.baseUrl ?? '.';
  const absoluteBaseUrl = resolvePath(fileURLToPath(projectRootUrl), baseUrl);
  const paths = compilerOptions.paths ?? {};

  matchPath = createMatchPath(absoluteBaseUrl, paths);
} catch (error) {
  console.warn('Failed to initialise tsconfig-paths loader. Path mappings will be unavailable.', error);
}

const extensions = ['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs', '.json'];

function maybeResolveWithPaths(specifier) {
  if (!matchPath) {
    return specifier;
  }

  if (specifier.startsWith('.') || specifier.startsWith('/') || specifier.startsWith('file:')) {
    return specifier;
  }

  const matched = matchPath(specifier, undefined, undefined, extensions);
  if (!matched) {
    return specifier;
  }

  let resolvedPath = matched;
  if (!resolvedPath.startsWith('file://') && !existsSync(resolvedPath)) {
    for (const extension of extensions) {
      const candidate = resolvedPath.endsWith(extension)
        ? resolvedPath
        : `${resolvedPath}${extension}`;

      if (existsSync(candidate)) {
        resolvedPath = candidate;
        break;
      }
    }
  }

  if (resolvedPath.startsWith('file://')) {
    return resolvedPath;
  }

  const resolved = pathToFileURL(resolvedPath).href;
  return resolved;
}

export async function resolve(specifier, context, defaultResolve) {
  const mappedSpecifier = maybeResolveWithPaths(specifier);
  return tsNode.resolve(mappedSpecifier, context, defaultResolve);
}

export async function load(url, context, defaultLoad) {
  return tsNode.load(url, context, defaultLoad);
}

export const getFormat = tsNode.getFormat;
export const transformSource = tsNode.transformSource;
