import {defineConfig} from 'vite';
import path from "path";
import fs from "fs";
import {load} from "cheerio";
import crypto from "crypto";

const packageJsonPath = path.resolve(__dirname, 'package.json');
const manifestJsonPath = path.resolve(__dirname, 'manifest.json');

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        listing: 'src/content/listing.js',
      },
      output: {
        dir: path.resolve(__dirname, 'build', 'assets', 'content'),
        inlineDynamicImports: false,
        entryFileNames: '[name].js',
        format: "iife"
      },
    },
    emptyOutDir: false,
  },
  resolve: {
    alias: {
      "$lib": path.resolve(__dirname, 'src/lib'),
      "$styles": path.resolve(__dirname, 'src/styles'),
    }
  },
  plugins: [
    {
      name: 'extract-inline-js',
      async buildEnd() {
        const buildPath = path.resolve(__dirname, 'build');
        const indexFilePath = path.resolve(buildPath, 'index.html');
        const indexHtml = fs.readFileSync(indexFilePath, 'utf8');

        const ch = load(indexHtml);

        ch('script').each((index, scriptElement) => {
          const $script = ch(scriptElement);
          const scriptContent = $script.text();

          const entryHash = crypto.createHash('sha256')
            .update(scriptContent)
            .digest('base64url');

          const scriptName = `init.${entryHash.slice(0, 8)}.js`;
          const scriptFilePath = path.resolve(buildPath, scriptName);
          const scriptPublicPath = `./${scriptName}`;

          fs.writeFileSync(scriptFilePath, scriptContent);

          $script.attr('src', scriptPublicPath);
          $script.text('');
        });

        fs.writeFileSync(indexFilePath, ch.html());
      }
    },
    {
      name: "bypass-manifest-extension",
      async buildEnd() {
        if (!fs.existsSync(manifestJsonPath)) {
          throw new Error(
            `The manifest.json file is missing from the root of the project.`
          );
        }

        if (!fs.existsSync(packageJsonPath)) {
          throw new Error(
            `The package.json file is missing from the root of the project.`
          );
        }

        const packageInformation = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const manifestInformation = JSON.parse(fs.readFileSync(manifestJsonPath, 'utf8'));

        manifestInformation.version = packageInformation.version;

        fs.writeFileSync(
          path.resolve(__dirname, 'build', 'manifest.json'),
          JSON.stringify(manifestInformation, null, 2)
        );
      }
    }
  ]
});
