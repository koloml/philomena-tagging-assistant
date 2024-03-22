import StorageHelper from "$lib/chrome/StorageHelper.js";

export default class ConfigurationController {
  /** @type {string} */
  #configurationName;

  /**
   * @param {string} configurationName Name of the configuration to work with.
   */
  constructor(configurationName) {
    this.#configurationName = configurationName;
  }

  /**
   * Read the setting with the given name.
   *
   * @param {string} settingName Setting name.
   * @param {any} [defaultValue] Default value to return if the setting does not exist. Defaults to `null`.
   *
   * @return {Promise<any|null>} The setting value or the default value if the setting does not exist.
   */
  async readSetting(settingName, defaultValue = null) {
    const settings = await ConfigurationController.#storageHelper.read(this.#configurationName, {});
    return settings[settingName] ?? defaultValue;
  }

  /**
   * Write the given value to the setting.
   *
   * @param {string} settingName Setting name.
   * @param {any} value Value to write.
   *
   * @return {Promise<void>}
   */
  async writeSetting(settingName, value) {
    const settings = await ConfigurationController.#storageHelper.read(this.#configurationName, {});

    settings[settingName] = value;

    ConfigurationController.#storageHelper.write(this.#configurationName, settings);
  }

  /**
   * Delete the specific setting.
   *
   * @param {string} settingName Setting name to delete.
   *
   * @return {Promise<void>}
   */
  async deleteSetting(settingName) {
    const settings = await ConfigurationController.#storageHelper.read(this.#configurationName, {});

    delete settings[settingName];

    ConfigurationController.#storageHelper.write(this.#configurationName, settings);
  }

  /**
   * Subscribe to changes in the configuration.
   *
   * @param {function(Record<string, any>)} callback Callback to call when the configuration changes. The new
   * configuration is passed as an argument.
   *
   * @return {function(): void} Unsubscribe function.
   */
  subscribeToChanges(callback) {
    /** @param {Record<string, StorageChange>} changes */
    const changesSubscriber = changes => {
      if (!changes[this.#configurationName]) {
        return;
      }

      callback(changes[this.#configurationName].newValue);
    }

    ConfigurationController.#storageHelper.subscribe(changesSubscriber);

    return () => ConfigurationController.#storageHelper.unsubscribe(changesSubscriber);
  }

  static #storageHelper = new StorageHelper(chrome.storage.local);
}