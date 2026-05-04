import swc from 'unplugin-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    isolate: false,
    poolOptions: {
      forks: {
        isolate: false,
        maxForks: 2,
        minForks: 1,
      },
    },
    pool: 'forks',
    include: ['./test/**/*.e2e-spec.ts'],
    setupFiles: ['./test/sut/e2e-tests-setup.mts'],
    root: './',
    hookTimeout: 60_000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
    reporters: [['default', { summary: false }], 'junit'],
    outputFile: './junit-e2e.xml',
  },
  plugins: [swc.vite(), tsconfigPaths()],
});
