// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const boundaries = require('eslint-plugin-boundaries');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    plugins: {
      boundaries,
    },
    settings: {
      'boundaries/elements': [
        { type: 'config',   pattern: 'src/config/**/*', mode: 'file' },
        { type: 'shared',  pattern: 'src/shared/**/*', mode: 'file' },
        { type: 'feature', pattern: 'src/features/*' },
        { type: 'app',     pattern: 'app/**/*', mode: 'file' },
      ],
    },
    rules: {
      "no-console": "warn",
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          rules: [
            {
              from: { type: 'feature' },
              allow: [
                { to: { type: 'shared' } },
                { to: { type: 'config' } },
                { to: { type: 'feature', internalPath: 'index.ts' } },
              ],
            },
            {
              from: { type: 'app' },
              allow: [
                { to: { type: 'shared' } },
                { to: { type: 'config' } },
                { to: { type: 'feature', internalPath: 'index.ts' } },
              ],
            },
            {
              from: { type: 'shared' },
              allow: [
                { to: { type: 'config' } },
                { to: { type: 'shared' } },
              ],
            },
          ],
        },
      ],
    },
  },
]);
