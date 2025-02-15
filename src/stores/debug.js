import { writable } from "svelte/store";

/**
 * This is readable version of storages. Any changes made to these objects will not be sent to the local storage.
 * @type {Writable<Record<string, Object>>}
 */
export const storagesCollection = writable({});

chrome.storage.local.get(storages => {
  storagesCollection.set(storages);
});

chrome.storage.local.onChanged.addListener(changes => {
  storagesCollection.update(storages => {
    for (let updatedStorageName of Object.keys(changes)) {
      storages[updatedStorageName] = changes[updatedStorageName].newValue;
    }

    return storages;
  })
});
