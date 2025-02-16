import { type Writable, writable } from "svelte/store";

// todo: Maybe this could be dynamically resolved using map of entities and not currently existing list of all settings
//  classes. For now it's just generic record.
type StorageContents = Record<string, any>;

/**
 * This is readable version of storages. Any changes made to these objects will not be sent to the local storage.
 */
export const storagesCollection: Writable<StorageContents> = writable({});

void chrome.storage.local.get<StorageContents>(null, storages => {
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
