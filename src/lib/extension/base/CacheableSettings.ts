import ConfigurationController from "$lib/extension/ConfigurationController";

export default class CacheableSettings<Fields> {
  #controller: ConfigurationController;
  #cachedValues: Map<keyof Fields, any> = new Map();
  #disposables: Function[] = [];

  constructor(settingsNamespace: string) {
    this.#controller = new ConfigurationController(settingsNamespace);

    this.#disposables.push(
      this.#controller.subscribeToChanges(settings => {
        for (const key of Object.keys(settings)) {
          this.#cachedValues.set(
            key as keyof Fields,
            settings[key]
          );
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
  protected async _resolveSetting<Key extends keyof Fields>(settingName: Key, defaultValue: Fields[Key]): Promise<Fields[Key]> {
    if (this.#cachedValues.has(settingName)) {
      return this.#cachedValues.get(settingName);
    }

    const settingValue = await this.#controller.readSetting(settingName as string, defaultValue);

    this.#cachedValues.set(settingName, settingValue);

    return settingValue;
  }

  /**
   * @param settingName Name of the setting to write.
   * @param value Value to pass.
   * @param force Ignore the cache and force the update.
   * @protected
   */
  async _writeSetting<Key extends keyof Fields>(settingName: Key, value: Fields[Key], force: boolean = false): Promise<void> {
    if (
      !force
      && this.#cachedValues.has(settingName)
      && this.#cachedValues.get(settingName) === value
    ) {
      return;
    }

    return this.#controller.writeSetting(
      settingName as string,
      value
    );
  }

  /**
   * Subscribe to the changes made to the storage.
   * @param {function(Object): void} callback Callback which will receive list of settings.
   * @return {function(): void} Unsubscribe function.
   */
  subscribe(callback: (settings: Partial<Fields>) => void): () => void {
    const unsubscribeCallback = this.#controller.subscribeToChanges(callback as (fields: Record<string, any>) => void);

    this.#disposables.push(unsubscribeCallback);

    return unsubscribeCallback;
  }

  dispose() {
    for (let disposeCallback of this.#disposables) {
      disposeCallback();
    }
  }
}
