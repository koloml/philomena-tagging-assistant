import {sveltekit} from '@sveltejs/kit/vite';
import {defineConfig} from 'vite';

export default defineConfig({
  build: {
    // SVGs imported from the FA6 don't need to be inlined!
    assetsInlineLimit: 0
  },
  plugins: [
    sveltekit(),
  ],
});
