import swc from 'unplugin-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 30000,
    include: ['./src/**/*.spec.ts'],
    root: './',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      statements: 5,
      branches: 30,
      functions: 30,
      lines: 5,
    },
    reporters: [['default', { summary: false }], 'junit'],
    outputFile: './junit-unit.xml',
  },
  plugins: [swc.vite(), tsconfigPaths()],
});
