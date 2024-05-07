import {loadManifest} from "./lib/manifest.js";
import path from "path";
import {buildScript, buildStyle} from "./lib/content-scripts.js";
import {normalizePath} from "vite";
import {extractInlineScriptsFromIndex} from "./lib/index-file.js";

/**
 * Build addition assets required for the extension and pack it into the directory.
 * @param {PackExtensionSettings} settings Build settings.
 */
export async function packExtension(settings) {
  const manifest = loadManifest(path.resolve(settings.rootDir, 'manifest.json'));

  // Since we CAN'T really build all scripts and stylesheets in a single build entry, we will run build for every single
  // one of them in a row. This way, no chunks will be generated. Thanks, ManifestV3!
  await manifest.mapContentScripts(async (entry) => {
    if (entry.js) {
      for (let scriptIndex = 0; scriptIndex < entry.js.length; scriptIndex++) {
        const builtScriptFilePath = await buildScript({
          input: path.resolve(settings.rootDir, entry.js[scriptIndex]),
          outputDir: settings.contentScriptsDir,
          rootDir: settings.rootDir,
        });

        entry.js[scriptIndex] = normalizePath(
          path.relative(
            settings.exportDir,
            builtScriptFilePath
          )
        );
      }
    }

    if (entry.css) {
      for (let styleIndex = 0; styleIndex < entry.css.length; styleIndex++) {
        const builtStylesheetFilePath = await buildStyle({
          input: path.resolve(settings.rootDir, entry.css[styleIndex]),
          outputDir: settings.contentScriptsDir,
          rootDir: settings.rootDir
        });

        entry.css[styleIndex] = normalizePath(
          path.relative(
            settings.exportDir,
            builtStylesheetFilePath
          )
        );
      }
    }

    return entry;
  });

  manifest.passVersionFromPackage(path.resolve(settings.rootDir, 'package.json'));
  manifest.saveTo(path.resolve(settings.exportDir, 'manifest.json'));

  extractInlineScriptsFromIndex(path.resolve(settings.exportDir, 'index.html'));
}

/**
 * @typedef {Object} PackExtensionSettings
 * @property {string} rootDir Root directory of the repository. Required for properly fetching source files.
 * @property {string} exportDir Directory of the built extension.
 * @property {string} contentScriptsDir Directory specifically for content scripts entries.
 */
