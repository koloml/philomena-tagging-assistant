import StorageHelper, { type StorageChangeSubscriber } from "$lib/browser/StorageHelper";
import type StorageEntity from "$lib/extension/base/StorageEntity";

export default class EntitiesController {
  static #storageHelper = new StorageHelper(chrome.storage.local);

  /**
   * Read all entities of the given type from the storage. Build the entities from the raw data and return them.
   *
   * @param entityName Name of the entity to read.
   * @param entityClass Class of the entity to read. Must have a constructor that accepts the ID and the settings
   * object.
   *
   * @return List of entities of the given type.
   */
  static async readAllEntities<Type extends StorageEntity<any>>(entityName: string, entityClass: new (...any: any[]) => Type): Promise<Type[]> {
    const rawEntities = await this.#storageHelper.read(entityName, {});

    if (!rawEntities || Object.keys(rawEntities).length === 0) {
      return [];
    }

    return Object
      .entries(rawEntities)
      .map(([id, settings]) => new entityClass(id, settings));
  }

  /**
   * Update the single entity in the storage. If the entity with the given ID already exists, it will be overwritten.
   *
   * @param entityName Name of the entity to update.
   * @param entity Entity to update.
   */
  static async updateEntity(entityName: string, entity: StorageEntity<Object>): Promise<void> {
    this.#storageHelper.write(
      entityName,
      Object.assign(
        await this.#storageHelper.read(
          entityName, {}
        ),
        {
          [entity.id]: entity.settings
        }
      )
    );
  }

  /**
   * Delete the entity with the given ID.
   *
   * @param entityName Name of the entity to delete.
   * @param entityId ID of the entity to delete.
   */
  static async deleteEntity(entityName: string, entityId: string): Promise<void> {
    const entities = await this.#storageHelper.read(entityName, {});
    delete entities[entityId];
    this.#storageHelper.write(entityName, entities);
  }

  /**
   * Subscribe to all changes made to the storage.
   *
   * @template EntityClass
   *
   * @param entityName Name of the entity to subscribe to.
   * @param entityClass Class of the entity to subscribe to.
   * @param callback Callback to call when the storage changes.
   * @return Unsubscribe function.
   */
  static subscribeToEntity<Type extends StorageEntity<any>>(entityName: string, entityClass: new (...any: any[]) => Type, callback: (entities: Type[]) => void): () => void {
    /**
     * Watch the changes made to the storage and call the callback when the entity changes.
     */
    const subscriber: StorageChangeSubscriber = changes => {
      if (!changes[entityName]) {
        return;
      }

      this.readAllEntities(entityName, entityClass)
        .then(callback);
    }

    this.#storageHelper.subscribe(subscriber);

    return () => this.#storageHelper.unsubscribe(subscriber);
  }
}
