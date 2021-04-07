/* eslint-disable import/no-extraneous-dependencies */
import svelte from 'rollup-plugin-svelte';
import { resolve } from 'path';

export default {
  plugins: [svelte({ emitCss: false })],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        // other: resolve(__dirname, 'other-page/index.html'),
      },
    },
  },
  optimizeDeps: {
    exclude: ['@marcellejs/backend'],
  },
};
