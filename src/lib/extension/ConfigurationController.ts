import StorageHelper, { type StorageChangeSubscriber } from "$lib/browser/StorageHelper";

export default class ConfigurationController {
  readonly #configurationName: string;
  readonly #storage: StorageHelper;

  /**
   * @param {string} configurationName Name of the configuration to work with.
   * @param {StorageHelper} [storage] Selected storage where the settings are stored in. If not provided, local storage
   * is used.
   */
  constructor(configurationName: string, storage: StorageHelper = new StorageHelper(chrome.storage.local)) {
    this.#configurationName = configurationName;
    this.#storage = storage;
  }

  /**
   * Read the setting with the given name.
   *
   * @param settingName Setting name.
   * @param [defaultValue] Default value to return if the setting does not exist. Defaults to `null`.
   *
   * @return The setting value or the default value if the setting does not exist.
   */
  async readSetting<Type = any, DefaultType = any>(settingName: string, defaultValue: DefaultType | null = null): Promise<Type | DefaultType> {
    const settings = await this.#storage.read(this.#configurationName, {});
    return settings[settingName] ?? defaultValue;
  }

  /**
   * Write the given value to the setting.
   *
   * @param settingName Setting name.
   * @param value Value to write.
   *
   * @return {Promise<void>}
   */
  async writeSetting(settingName: string, value: any): Promise<void> {
    const settings = await this.#storage.read(this.#configurationName, {});

    settings[settingName] = value;

    this.#storage.write(this.#configurationName, settings);
  }

  /**
   * Delete the specific setting.
   *
   * @param {string} settingName Setting name to delete.
   */
  async deleteSetting(settingName: string): Promise<void> {
    const settings = await this.#storage.read(this.#configurationName, {});

    delete settings[settingName];

    this.#storage.write(this.#configurationName, settings);
  }

  /**
   * Subscribe to changes in the configuration.
   *
   * @param {function(Record<string, any>)} callback Callback to call when the configuration changes. The new
   * configuration is passed as an argument.
   *
   * @return {function(): void} Unsubscribe function.
   */
  subscribeToChanges(callback: (record: Record<string, any>) => void): () => void {
    const subscriber: StorageChangeSubscriber = changes => {
      if (!changes[this.#configurationName]) {
        return;
      }

      callback(changes[this.#configurationName].newValue as Record<string, any>);
    }

    this.#storage.subscribe(subscriber);

    return () => this.#storage.unsubscribe(subscriber);
  }
}
