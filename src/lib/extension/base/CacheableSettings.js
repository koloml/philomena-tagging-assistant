import ConfigurationController from "$lib/extension/ConfigurationController.js";

export default class CacheableSettings {
  /** @type {ConfigurationController} */
  #controller;
  /** @type {Map<string, any>} */
  #cachedValues = new Map();
  /** @type {function[]} */
  #disposables = [];

  constructor(settingsNamespace) {
    this.#controller = new ConfigurationController(settingsNamespace);

    this.#disposables.push(
      this.#controller.subscribeToChanges(settings => {
        for (const key of Object.keys(settings)) {
          this.#cachedValues.set(key, settings[key]);
        }
      })
    );
  }

  /**
   * @template SettingType
   * @param {string} settingName
   * @param {SettingType} defaultValue
   * @return {Promise<SettingType>}
   * @protected
   */
  async _resolveSetting(settingName, defaultValue) {
    if (this.#cachedValues.has(settingName)) {
      return this.#cachedValues.get(settingName);
    }

    const settingValue = await this.#controller.readSetting(settingName, defaultValue);

    this.#cachedValues.set(settingName, settingValue);

    return settingValue;
  }

  /**
   * @param {string} settingName Name of the setting to write.
   * @param {*} value Value to pass.
   * @param {boolean} [force=false] Ignore the cache and force the update.
   * @return {Promise<void>}
   * @protected
   */
  async _writeSetting(settingName, value, force = false) {
    if (
      !force
      && this.#cachedValues.has(settingName)
      && this.#cachedValues.get(settingName) === value
    ) {
      return;
    }

    return this.#controller.writeSetting(settingName, value);
  }

  /**
   * Subscribe to the changes made to the storage.
   * @param {function(Object): void} callback Callback which will receive list of settings.
   * @return {function(): void} Unsubscribe function.
   */
  subscribe(callback) {
    const unsubscribeCallback = this.#controller.subscribeToChanges(callback);

    this.#disposables.push(unsubscribeCallback);

    return unsubscribeCallback;
  }

  dispose() {
    for (let disposeCallback of this.#disposables) {
      disposeCallback();
    }
  }
}
