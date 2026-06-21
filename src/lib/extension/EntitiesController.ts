import StorageHelper, { type StorageChangeSubscriber } from "$lib/browser/StorageHelper";
import type StorageEntity from "$lib/extension/base/StorageEntity";

export default class EntitiesController {
  /**
   * Instance of storage helper used to store/read/subscribe to storage changes.
   *
   * Mainly exposed for the testing purposes. When class is loaded outside of extension context, will hold `null`
   * instead. Any operations of entities will throw an error in this case.
   */
  static storage: StorageHelper | null = typeof chrome !== 'undefined'
    ? new StorageHelper(chrome.storage.local)
    : null;

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
    if (!this.storage) {
      throw new Error('Missing storage!');
    }

    const rawEntities = await this.storage.read(entityName, {});

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
    if (!this.storage) {
      throw new Error('Missing storage!');
    }

    this.storage.write(
      entityName,
      Object.assign(
        await this.storage.read(
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
    if (!this.storage) {
      throw new Error('Missing storage!');
    }

    const entities = await this.storage.read(entityName, {});
    delete entities[entityId];
    this.storage.write(entityName, entities);
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
    if (!this.storage) {
      throw new Error('Missing storage!');
    }

    const storage = this.storage;

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

    storage.subscribe(subscriber);

    return () => storage.unsubscribe(subscriber);
  }
}
