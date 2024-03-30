import {defineConfig, normalizePath} from 'vite';
import path from "path";
import fs from "fs";
import {load} from "cheerio";
import crypto from "crypto";

const packageJsonPath = path.resolve(__dirname, 'package.json');
const manifestJsonPath = path.resolve(__dirname, 'manifest.json');

const buildDirectoryPath = path.resolve(__dirname, 'build');
const contentScriptsDirectoryPath = path.resolve(buildDirectoryPath, 'assets', 'content');

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

/** @type {import('vite').RollupOptions} */
const rollupOptions = {
  input: {},
  output: {
    dir: contentScriptsDirectoryPath,
    entryFileNames: '[name].js',
    assetFileNames: '[name].[ext]',
  }
};

function hashFilePath(filePath) {
  return crypto
    .createHash('sha256')
    .update(filePath)
    .digest('base64url')
    .slice(0, 8);
}

// This is somewhat hacky, but it works for now. This code goes over the list of content scripts, adding them to the
// rollupOptions.input object, and then modifying the content_scripts array to point to the built file names.
// TODO: This fragment should probably somehow be moved into a plugin, together with the code that copies the source
//  mainifest.json file to the build directory.
if (manifestInformation?.['content_scripts']) {
  manifestInformation['content_scripts'] = manifestInformation['content_scripts'].map(entry => {
    if (entry.js) {
      entry.js = entry.js.map(filePath => {
        const fileName = path.basename(filePath);
        const baseName = fileName.split('.').slice(0, -1).join('.');
        const outputBaseName = `${baseName}-${hashFilePath(filePath)}`;

        rollupOptions.input[outputBaseName] = filePath;

        return normalizePath(
          path.relative(
            buildDirectoryPath,
            path.resolve(contentScriptsDirectoryPath, outputBaseName + '.js')
          )
        );
      });
    }

    if (entry.css) {
      entry.css = entry.css.map(filePath => {
        const fileName = path.basename(filePath);
        const baseName = fileName.split('.').slice(0, -1).join('.');
        const outputBaseName = `${baseName}-${hashFilePath(filePath)}`;

        rollupOptions.input[outputBaseName] = filePath;

        return normalizePath(
          path.relative(
            buildDirectoryPath,
            path.resolve(contentScriptsDirectoryPath, outputBaseName + '.css')
          )
        );
      })
    }

    return entry;
  });
}

export default defineConfig({
  build: {
    rollupOptions,
    emptyOutDir: false,
  },
  resolve: {
    alias: {
      "$lib": path.resolve(__dirname, 'src/lib'),
      "$entities": path.resolve(__dirname, 'src/lib/extension/entities'),
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
        manifestInformation.version = packageInformation.version;

        fs.writeFileSync(
          path.resolve(__dirname, 'build', 'manifest.json'),
          JSON.stringify(manifestInformation, null, 2)
        );
      }
    }
  ]
});
