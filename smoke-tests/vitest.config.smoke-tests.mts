import swc from 'unplugin-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    root: './',
    include: ['./smoke-tests/*.smoke-tests-spec.ts'],
    reporters: [['default', { summary: false }], 'junit'],
    outputFile: './junit-smoke-tests.xml',
  },
  plugins: [swc.vite(), tsconfigPaths()],
});
