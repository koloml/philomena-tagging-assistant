import StorageHelper from "$lib/browser/StorageHelper.js";

export default class EntitiesController {
  static #storageHelper = new StorageHelper(chrome.storage.local);

  /**
   * Read all entities of the given type from the storage. Build the entities from the raw data and return them.
   *
   * @template EntityClass
   *
   * @param {string} entityName Name of the entity to read.
   * @param {EntityClass} entityClass Class of the entity to read. Must have a constructor that accepts the ID and the
   * settings object.
   *
   * @return {Promise<InstanceType<EntityClass>[]>} List of entities of the given type.
   */
  static async readAllEntities(entityName, entityClass) {
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
   * @param {string} entityName Name of the entity to update.
   * @param {StorageEntity} entity Entity to update.
   *
   * @return {Promise<void>}
   */
  static async updateEntity(entityName, entity) {
    await this.#storageHelper.write(
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
   * @param {string} entityName Name of the entity to delete.
   * @param {string} entityId ID of the entity to delete.
   *
   * @return {Promise<void>}
   */
  static async deleteEntity(entityName, entityId) {
    const entities = await this.#storageHelper.read(entityName, {});
    delete entities[entityId];
    await this.#storageHelper.write(entityName, entities);
  }

  /**
   * Subscribe to all changes made to the storage.
   *
   * @template EntityClass
   *
   * @param {string} entityName Name of the entity to subscribe to.
   * @param {EntityClass} entityClass Class of the entity to subscribe to.
   * @param {function(InstanceType<EntityClass>[]): any} callback Callback to call when the storage changes.
   * @return {function(): void} Unsubscribe function.
   */
  static subscribeToEntity(entityName, entityClass, callback) {
    /**
     * Watch the changes made to the storage and call the callback when the entity changes.
     * @param {Object<string, StorageChange>} changes Changes made to the storage.
     */
    const storageChangesSubscriber = changes => {
      if (!changes[entityName]) {
        return;
      }

      this.readAllEntities(entityName, entityClass)
        .then(callback);
    }

    this.#storageHelper.subscribe(storageChangesSubscriber);

    return () => this.#storageHelper.unsubscribe(storageChangesSubscriber);
  }
}
