/**
 * Helper class to read and write JSON objects to the local storage.
 * @class
 */
class StorageHelper {
  /**
   * @type {chrome.storage.StorageArea}
   */
  #storageArea;

  /**
   * @param {chrome.storage.StorageArea} storageArea
   */
  constructor(storageArea) {
    this.#storageArea = storageArea;
  }

  /**
   * Read the following entry from the local storage as a JSON object.
   *
   * @param {string} key Key of the entry to read.
   * @param {any} defaultValue Default value to return if the entry does not exist.
   *
   * @return {Promise<any>} The JSON object or the default value if the entry does not exist.
   */
  async read(key, defaultValue = null) {
    return (await this.#storageArea.get(key))?.[key] || defaultValue;
  }

  /**
   * Write the following JSON object to the local storage.
   *
   * @param {string} key Key of the entry to write.
   * @param {any} value JSON object to write.
   */
  write(key, value) {
    void this.#storageArea.set({[key]: value});
  }

  /**
   * Subscribe to changes in the local storage.
   * @param {function(Record<string, chrome.storage.StorageChange>): void} callback
   */
  subscribe(callback) {
    this.#storageArea.onChanged.addListener(callback);
  }

  /**
   * Unsubscribe from changes in the local storage.
   * @param {function(Record<string, chrome.storage.StorageChange>): void} callback
   */
  unsubscribe(callback) {
    this.#storageArea.onChanged.removeListener(callback);
  }
}

export default StorageHelper;
