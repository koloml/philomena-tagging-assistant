import ConfigurationController from "$lib/extension/ConfigurationController";

/**
 * Initialization options for the preference field helper class.
 */
type PreferenceFieldOptions<FieldKey, ValueType> = {
  /**
   * Field name which will be read or updated.
   */
  field: FieldKey;
  /**
   * Default value for this field.
   */
  defaultValue: ValueType;
}

/**
 * Helper class for a field. Contains all information needed to read or set the values into the preferences while
 * retaining proper types for the values.
 */
export class PreferenceField<
  /**
   * Mapping of keys to fields. Usually this is the same type used for defining the structure of the storage itself.
   * Is automatically captured when preferences class instance is passed into the constructor.
   */
  Fields extends Record<string, any> = Record<string, any>,
  /**
   * Field key for resolving which value will be resolved from getter or which value type should be passed into the
   * setter method.
   */
  Key extends keyof Fields = keyof Fields
> {
  /**
   * Instance of the preferences class to read/update values on.
   * @private
   */
  readonly #preferences: CacheablePreferences<Fields>;
  /**
   * Key of a field we want to read or write with the helper class.
   * @private
   */
  readonly #fieldKey: Key;
  /**
   * Stored default value for a field.
   * @private
   */
  readonly #defaultValue: Fields[Key];

  /**
   * @param preferencesInstance Instance of preferences to work with.
   * @param options Initialization options for this field.
   */
  constructor(preferencesInstance: CacheablePreferences<Fields>, options: PreferenceFieldOptions<Key, Fields[Key]>) {
    this.#preferences = preferencesInstance;
    this.#fieldKey = options.field;
    this.#defaultValue = options.defaultValue;
  }

  /**
   * Read the field value from the preferences.
   */
  get() {
    return this.#preferences.readRaw(this.#fieldKey, this.#defaultValue);
  }

  /**
   * Update the preference field with provided value.
   * @param value Value to update the field with.
   */
  set(value: Fields[Key]) {
    return this.#preferences.writeRaw(this.#fieldKey, value);
  }

  get key(): Key {
    return this.#fieldKey;
  }
}

/**
 * Helper type for preference classes to enforce having field objects inside the preferences instance. It should be
 * applied on child classes of {@link CacheablePreferences}.
 */
export type WithFields<FieldsType extends Record<string, any>> = {
  readonly [FieldKey in keyof FieldsType]: PreferenceField<FieldsType, FieldKey>;
}

/**
 * Base class for any preferences instances. It contains methods for reading or updating any arbitrary values inside
 * extension storage. It also tries to save the value resolved from the storage into special internal cache after the
 * first call.
 *
 * Should be usually paired with implementation of {@link WithFields} helper type as interface for much more usable
 * API.
 */
export default abstract class CacheablePreferences<Fields> {
  readonly #controller: ConfigurationController;
  readonly #cachedValues: Map<keyof Fields, any> = new Map();
  readonly #disposables: Function[] = [];

  /**
   * @param settingsNamespace Name of the field inside the extension storage where these preferences stored.
   * @param [controller] Configuration controller. If not provided, default controller will be used.
   * @protected
   */
  protected constructor(settingsNamespace: string, controller: ConfigurationController = new ConfigurationController(settingsNamespace)) {
    this.#controller = controller;

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
   * Read the value from the preferences by the field. This function doesn't handle default values, so you generally
   * should avoid using this method and accessing the special fields instead.
   * @param settingName Name of the field to read.
   * @param defaultValue Default value to return if value is not set.
   * @return Value of the field or default value if it is not set.
   */
  public async readRaw<Key extends keyof Fields>(settingName: Key, defaultValue: Fields[Key]): Promise<Fields[Key]> {
    if (this.#cachedValues.has(settingName)) {
      return this.#cachedValues.get(settingName);
    }

    const settingValue = await this.#controller.readSetting(settingName as string, defaultValue);

    this.#cachedValues.set(settingName, settingValue);

    return settingValue;
  }

  /**
   * Write the value into specific field of the storage. You should generally avoid calling this function directly and
   * instead rely on special field helpers inside your preferences class.
   * @param settingName Name of the setting to write.
   * @param value Value to pass.
   * @param force Ignore the cache and force the update.
   * @protected
   */
  async writeRaw<Key extends keyof Fields>(settingName: Key, value: Fields[Key], force: boolean = false): Promise<void> {
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
   * @param callback Callback which will receive list of settings on every update. This function will not be called
   * on initialization.
   * @return Unsubscribe function to call in order to disable the watching.
   */
  subscribe(callback: (settings: Partial<Fields>) => void): () => void {
    const unsubscribeCallback = this.#controller.subscribeToChanges(callback as (fields: Record<string, any>) => void);

    this.#disposables.push(unsubscribeCallback);

    return unsubscribeCallback;
  }

  /**
   * Completely disable all subscriptions.
   */
  dispose() {
    for (let disposeCallback of this.#disposables) {
      disposeCallback();
    }
  }
}
