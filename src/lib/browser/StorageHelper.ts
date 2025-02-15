/**
 * Changes subscribe function. It receives changes with old and new value for keys of the storage.
 */
export type StorageChangeSubscriber = (changes: Record<string, chrome.storage.StorageChange>) => void;

/**
 * Helper class to read and write JSON objects to the local storage.
 */
export default class StorageHelper {
  readonly #storageArea: chrome.storage.StorageArea;

  constructor(storageArea: chrome.storage.StorageArea) {
    this.#storageArea = storageArea;
  }

  /**
   * Read the following entry from the local storage as a JSON object.
   *
   * @param key Key of the entry to read.
   * @param defaultValue Default value to return if the entry does not exist.
   *
   * @return The JSON object or the default value if the entry does not exist.
   */
  async read<Type = any, DefaultType = any>(key: string, defaultValue: DefaultType | null = null): Promise<Type | DefaultType> {
    return (await this.#storageArea.get(key))?.[key] || defaultValue;
  }

  /**
   * Write the following JSON object to the local storage.
   *
   * @param key Key of the entry to write.
   * @param value Value to write.
   */
  write(key: string, value: any): void {
    void this.#storageArea.set({[key]: value});
  }

  /**
   * Subscribe to changes in the local storage.
   * @param callback Listener function to receive changes.
   */
  subscribe(callback: StorageChangeSubscriber): void {
    this.#storageArea.onChanged.addListener(callback);
  }

  /**
   * Unsubscribe from changes in the local storage.
   * @param callback Reference to the callback for unsubscribing.
   */
  unsubscribe(callback: StorageChangeSubscriber): void {
    this.#storageArea.onChanged.removeListener(callback);
  }
}
