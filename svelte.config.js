import adapter from '@sveltejs/adapter-static';
import {vitePreprocess} from "@sveltejs/vite-plugin-svelte";
import * as fs from "fs";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    // Can't use default _app, since "_" is reserved symbol in Chrome
    appDir: "assets/popup",
    adapter: adapter({
      strict: false
    }),
    version: {
      name: Date.now().toString(36)
    },
    alias: {
      "$components": "./src/components",
      "$styles": "./src/styles",
      "$stores": "./src/stores",
      "$entities": "./src/lib/extension/entities",
    },
    typescript: {
      config: config => {
        config.compilerOptions = config.compilerOptions || {};
        config.compilerOptions.allowImportingTsExtension = true
      }
    }
  },
  preprocess: [
    vitePreprocess({
      // SCSS is used by the project
      style: {
        postcss: true
      }
    })
  ]
};

// Providing the version from package.json for rendering it in the UI.
if (fs.existsSync('package.json')) {
  const packageInformation = JSON.parse(
    fs.readFileSync('package.json', 'utf8')
  );

  config.kit.version.name = packageInformation.version;
}

export default config;
