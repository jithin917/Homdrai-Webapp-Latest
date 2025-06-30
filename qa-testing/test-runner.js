// Test Runner Configuration
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./qa-testing/test-setup.js'],
    globals: true,
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'qa-testing/',
        '**/*.d.ts',
      ],
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});