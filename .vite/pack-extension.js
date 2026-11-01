import { loadManifest } from "./lib/manifest.js";
import path from "path";
import { buildScriptsAndStyles } from "./lib/content-scripts.js";
import { extractInlineScriptsFromIndex } from "./lib/index-file.js";
import { normalizePath } from "vite";
import fs from "fs";

/**
 * Build addition assets required for the extension and pack it into the directory.
 * @param {PackExtensionSettings} settings Build settings.
 */
export async function packExtension(settings) {
  const manifest = loadManifest(path.resolve(settings.rootDir, 'manifest.json'));

  const replacementMapping = await buildScriptsAndStyles({
    inputs: manifest.collectContentScripts(),
    outputDir: settings.contentScriptsDir,
    rootDir: settings.rootDir,
  });

  await manifest.mapContentScripts(async entry => {
    if (entry.js) {
      entry.js = entry.js
        .map(jsSourcePath => {
          if (!replacementMapping.has(jsSourcePath)) {
            return [];
          }

          return replacementMapping.get(jsSourcePath);
        })
        .flat(1)
        .map(pathName => {
          return normalizePath(
            path.relative(
              settings.exportDir,
              path.join(
                settings.contentScriptsDir,
                pathName
              )
            )
          )
        });
    }

    if (entry.css) {
      entry.css = entry.css
        .map(jsSourcePath => {
          if (!replacementMapping.has(jsSourcePath)) {
            return [];
          }

          return replacementMapping.get(jsSourcePath);
        })
        .flat(1)
        .map(pathName => {
          return normalizePath(
            path.relative(
              settings.exportDir,
              path.join(
                settings.contentScriptsDir,
                pathName
              )
            )
          )
        })
    }

    return entry;
  })

  switch (process.env.SITE) {
    case 'localhost':
      manifest.replaceHostTo('localhost');
      manifest.replaceBooruNameWith('Philomena');
      manifest.setGeckoIdentifier('philomena-tagging-assistant@thecore.city');
      break;

    case 'derpibooru':
      manifest.replaceHostTo([
        'derpibooru.org',
        'trixiebooru.org'
      ]);
      manifest.replaceBooruNameWith('Derpibooru');
      manifest.setGeckoIdentifier('derpibooru-tagging-assistant@thecore.city');
      break;

    case 'tantabus':
      manifest.replaceHostTo('tantabus.ai');
      manifest.replaceBooruNameWith('Tantabus');
      manifest.setGeckoIdentifier('tantabus-tagging-assistant@thecore.city');
      break;

    default:
      if (process.env.SITE) {
        console.warn('No replacement set up for site: ' + process.env.SITE);
      }
  }

  manifest.passVersionFromPackage(path.resolve(settings.rootDir, 'package.json'));
  manifest.saveTo(path.resolve(settings.exportDir, 'manifest.json'));

  const iconsDirectory = path.resolve(settings.exportDir, 'icons');

  switch (process.env.SITE) {
    case "derpibooru":
    case "tantabus":
      const siteIconsDirectory = path.resolve(iconsDirectory, process.env.SITE);

      if (!fs.existsSync(siteIconsDirectory)) {
        console.warn(`Can't find replacement icons for site ${process.env.SITE}`);
        break;
      }

      console.log(`Found replacement icons for ${process.env.SITE}, swapping them...`);

      fs.readdirSync(siteIconsDirectory).forEach(fileName => {
        const originalIconPath = path.resolve(settings.exportDir, fileName);
        const replacementIconPath = path.resolve(siteIconsDirectory, fileName);

        if (!fs.existsSync(originalIconPath)) {
          console.warn(`Original icon not found: ${originalIconPath}`)
          return;
        }

        fs.rmSync(originalIconPath);
        fs.cpSync(replacementIconPath, originalIconPath);

        console.log(`Replaced: ${path.relative(settings.rootDir, replacementIconPath)} → ${path.relative(settings.rootDir, originalIconPath)}`);
      });

      break;
  }

  if (fs.existsSync(iconsDirectory)) {
    console.log('Cleaning up icon replacements directory');

    fs.rmSync(iconsDirectory, {
      recursive: true,
      force: true,
    });
  }

  extractInlineScriptsFromIndex(path.resolve(settings.exportDir, 'index.html'));
}

/**
 * @typedef {Object} PackExtensionSettings
 * @property {string} rootDir Root directory of the repository. Required for properly fetching source files.
 * @property {string} exportDir Directory of the built extension.
 * @property {string} contentScriptsDir Directory specifically for content scripts entries.
 */
