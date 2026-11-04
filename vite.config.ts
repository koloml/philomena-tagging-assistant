import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { ScssViteReadEnvVariableFunctionPlugin } from "./.vite/plugins/scss-read-env-variable-function.js";
import { SwapDefinedVariablesPlugin } from "./.vite/plugins/swap-defined-variables.js";

export default defineConfig(() => {
  return {
    build: {
      // SVGs imported from the FA6 don't need to be inlined!
      assetsInlineLimit: 0
    },
    plugins: [
      sveltekit(),
      ScssViteReadEnvVariableFunctionPlugin(),
      SwapDefinedVariablesPlugin({
        envVariable: 'SITE',
        expectedValue: 'derpibooru',
        define: {
          __CURRENT_SITE__: JSON.stringify('derpibooru'),
          __CURRENT_SITE_NAME__: JSON.stringify('Derpibooru'),
        }
      }),
      SwapDefinedVariablesPlugin({
        envVariable: 'SITE',
        expectedValue: 'tantabus',
        define: {
          __CURRENT_SITE__: JSON.stringify('tantabus'),
          __CURRENT_SITE_NAME__: JSON.stringify('Tantabus'),
        }
      }),
    ],
    test: {
      globals: true,
      environment: 'jsdom',
      exclude: ['**/node_modules/**', '.*\\.d\\.ts$', '.*\\.spec\\.ts$'],
      coverage: {
        reporter: ['text', 'html'],
        include: ['src/lib/**/*.{js,ts}'],
      }
    },
    define: {
      __CURRENT_SITE__: JSON.stringify('furbooru'),
      __CURRENT_SITE_NAME__: JSON.stringify('Furbooru'),
    }
  };
});
