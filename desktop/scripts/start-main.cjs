require('ts-node/register/transpile-only');
require('tsconfig-paths/register');

const path = require('node:path');

const mainEntry = path.join(__dirname, '..', 'src', 'main', 'index.ts');

require(mainEntry);
