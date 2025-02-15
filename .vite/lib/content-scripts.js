import {build} from "vite";
import {createHash} from "crypto";
import path from "path";
import fs from "fs";

/**
 * Create the result base file name for the file.
 * @param {string} inputPath Path to the original filename.
 * @return {string} Result base file name without extension. Contains original filename + hash suffix.
 */
function createOutputBaseName(inputPath) {
  const hashSuffix = createHash('sha256')
    .update(
      // Yes, suffix is only dependent on the entry file, dependencies are not included.
      fs.readFileSync(inputPath, 'utf8')
    )
    .digest('base64url')
    .substring(0, 8);

  const baseName = path.basename(inputPath, path.extname(inputPath));

  return `${baseName}-${hashSuffix}`;
}

/**
 * Small workaround plugin to cover each individual content script into IIFE. This is pretty much mandatory to use,
 * otherwise helper functions made by Vite will collide with each other. Only include this plugin into config with
 * script!
 * @return {import('vite').Plugin}
 */
function wrapScriptIntoIIFE() {
  return {
    name: 'wrap-scripts-into-iife',
    generateBundle(outputBundles, bundle) {
      Object.keys(bundle).forEach(fileName => {
        const file = bundle[fileName];

        file.code = `(() => {\n${file.code}})();`
      });
    }
  }
}

/**
 * Default aliases used inside popup app.
 * @param {string} rootDir Root directory of the repo for building paths.
 * @return {Record<string, string>} Aliases to include into the config object.
 */
function makeAliases(rootDir) {
  return {
    "$config": path.resolve(rootDir, 'src/config'),
    "$lib": path.resolve(rootDir, 'src/lib'),
    "$entities": path.resolve(rootDir, 'src/lib/extension/entities'),
    "$styles": path.resolve(rootDir, 'src/styles'),
  }
}

/**
 * Build the selected script separately.
 * @param {AssetBuildOptions} buildOptions Building options for the script.
 * @return {Promise<string>} Result file path.
 */
export async function buildScript(buildOptions) {
  const outputBaseName = createOutputBaseName(buildOptions.input);

  await build({
    configFile: false,
    publicDir: false,
    build: {
      rollupOptions: {
        input: {
          [outputBaseName]: buildOptions.input
        },
        output: {
          dir: buildOptions.outputDir,
          entryFileNames: '[name].js'
        }
      },
      emptyOutDir: false,
    },
    resolve: {
      alias: makeAliases(buildOptions.rootDir)
    },
    plugins: [
      wrapScriptIntoIIFE()
    ]
  });

  return path.resolve(buildOptions.outputDir, `${outputBaseName}.js`);
}

/**
 * Build the selected stylesheet.
 * @param {AssetBuildOptions} buildOptions Build options for the stylesheet.
 * @return {Promise<string>} Result file path.
 */
export async function buildStyle(buildOptions) {
  const outputBaseName = createOutputBaseName(buildOptions.input);

  await build({
    configFile: false,
    publicDir: false,
    build: {
      rollupOptions: {
        input: {
          [outputBaseName]: buildOptions.input
        },
        output: {
          dir: buildOptions.outputDir,
          entryFileNames: '[name].js',
          assetFileNames: '[name].[ext]',
        }
      },
      emptyOutDir: false,
    },
    resolve: {
      alias: makeAliases(buildOptions.rootDir)
    }
  });

  return path.resolve(buildOptions.outputDir, `${outputBaseName}.css`);
}

/**
 * @typedef {Object} AssetBuildOptions
 * @property {string} input Full path to the input file to build.
 * @property {string} outputDir Destination folder for the script.
 * @property {string} rootDir Root directory of the repository.
 */
