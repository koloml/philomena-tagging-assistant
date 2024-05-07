import fs from "fs";

/**
 * Helper class for processing and using manifest for packing the extension.
 */
class ManifestProcessor {
  /**
   * Current state of the manifest object.
   * @type {Manifest}
   */
  #manifestObject;

  /**
   * @param {Manifest} parsedManifest Original manifest contents parsed as JSON object.
   */
  constructor(parsedManifest) {
    this.#manifestObject = parsedManifest;
  }

  /**
   * Map over every content script defined in the manifest. If no content scripts defined, no calls will be made to the
   * callback.
   *
   * @param {function(ContentScriptsEntry): Promise<ContentScriptsEntry>} mapCallback Processing function to call on
   * every entry. Entries should be modified and returned. Function should be asynchronous.
   *
   * @return {Promise<void>}
   */
  async mapContentScripts(mapCallback) {
    const contentScripts = this.#manifestObject.content_scripts;

    if (!contentScripts) {
      console.info('No content scripts to map over.');
      return;
    }

    for (let entryIndex = 0; entryIndex < contentScripts.length; entryIndex++) {
      contentScripts[entryIndex] = await mapCallback(contentScripts[entryIndex]);
    }
  }

  /**
   * Pass the version of the plugin from following package.json file.
   *
   * @param {string} packageFilePath Path to the JSON file to parse and extract the version from. If version is not
   * found, original version will be kept.
   */
  passVersionFromPackage(packageFilePath) {
    /** @type {PackageObject} */
    const packageObject = JSON.parse(fs.readFileSync(packageFilePath, 'utf8'));

    if (packageObject.version) {
      this.#manifestObject.version = packageObject.version;
    }
  }

  /**
   * Save the current state of the manifest into the selected file.
   *
   * @param {string} manifestFilePath File to write the resulting manifest to. Should be called after all the
   * modifications.
   */
  saveTo(manifestFilePath) {
    fs.writeFileSync(
      manifestFilePath,
      JSON.stringify(this.#manifestObject, null, 2),
      {
        encoding: 'utf8'
      }
    );
  }
}

/**
 * Load the manifest and create a processor object.
 *
 * @param {string} filePath Path to the original manifest file.
 *
 * @return {ManifestProcessor} Object for manipulating manifest file.
 */
export function loadManifest(filePath) {
  const manifest = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  return new ManifestProcessor(manifest);
}

/**
 * @typedef {Object} Manifest
 * @property {string} version
 * @property {ContentScriptsEntry[]|undefined} content_scripts
 */

/**
 * @typedef {Object} ContentScriptsEntry
 * @property {string[]} mathces
 * @property {string[]|undefined} js
 * @property {string[]|undefined} css
 */

/**
 * @typedef {Object} PackageObject
 * @property {string|undefined} version
 */
