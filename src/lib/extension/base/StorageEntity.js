import EntitiesController from "$lib/extension/EntitiesController.js";

class StorageEntity {
  /**
   * @type {string}
   */
  #id;

  /**
   * @type {Object}
   */
  #settings;

  /**
   * @param {string} id
   * @param {Object} settings
   */
  constructor(id, settings = {}) {
    this.#id = id;
    this.#settings = settings;
  }

  /**
   * @return {string}
   */
  get id() {
    return this.#id;
  }

  /**
   * @return {Object}
   */
  get settings() {
    return this.#settings;
  }

  static _entityName = "entity";

  async save() {
    await EntitiesController.updateEntity(this.constructor._entityName, this);
  }

  async delete() {
    await EntitiesController.deleteEntity(this.constructor._entityName, this.id);
  }

  /**
   * Static function to read all entities of this type from the storage. Must be implemented in the child class.
   * @return {Promise<array>}
   */
  static async readAll() {
    throw new Error("Not implemented");
  }
}

export default StorageEntity;