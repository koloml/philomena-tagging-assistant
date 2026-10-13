import type { Writable } from "svelte/store";
import CacheablePreferences, { type PreferenceField } from "$lib/extension/base/CacheablePreferences";

interface PrerefenceConnectionOptions<ValueType> {
  /**
   * Optional callback to apply modifications to the value when sending them from the preference field to the single
   * storage. If not provided, value itself will be sent instead.
   */
  updateToStore?: (value: any) => ValueType;
}

export class PreferenceSync<PreferencesType extends Record<string, any> = Record<string, any>> {
  readonly #preferences: CacheablePreferences<PreferencesType>;
  readonly #syncedPairs: [PreferenceField<PreferencesType, string>, Writable<any>, PrerefenceConnectionOptions<any>][] = [];

  protected constructor(preferences: CacheablePreferences<PreferencesType>) {
    this.#preferences = preferences;
  }

  /**
   * Connect the specific preference field to the provided storage.
   * @param field Field object.
   * @param store Storage object. Should contain the appropriate type for the value.
   * @param [options] Additional settings.
   */
  connect<FieldKey extends keyof PreferencesType>(
    field: PreferenceField<PreferencesType, FieldKey>,
    store: Writable<PreferencesType[FieldKey]>,
    options: PrerefenceConnectionOptions<PreferencesType[FieldKey]> = {}
  ): this {
    this.#syncedPairs.push([field as any, store, options]);

    return this;
  }

  async startSync(): Promise<void> {
    await Promise.allSettled(
      this.#syncedPairs.map(
        ([field, store, options]) => field.get()
          .then(initialValue => store.set(options.updateToStore?.(initialValue) ?? initialValue))
      )
    );

    for (const [field, store] of this.#syncedPairs) {
      store.subscribe(value => field.set(value));
    }

    this.#preferences.subscribe(updatedSettings => {
      for (const [field, store, options] of this.#syncedPairs) {
        if (!(field.key in updatedSettings)) {
          continue;
        }

        const updatedValue = updatedSettings[field.key];
        store.set(options.updateToStore?.(updatedValue) ?? updatedValue);
      }
    });
  }

  static for<
    PreferencesType extends Record<string, any> = Record<string, any>
  >(preferences: CacheablePreferences<PreferencesType>): PreferenceSync<PreferencesType> {
    return new PreferenceSync<PreferencesType>(preferences);
  }
}
