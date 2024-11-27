import EntitiesController from "$lib/extension/EntitiesController.js";

export default abstract class StorageEntity<SettingsType extends Object = {}> {
  /**
   * @type {string}
   */
  readonly #id: string;

  /**
   * @type {Object}
   */
  readonly #settings: SettingsType;

  constructor(id: string, settings: SettingsType) {
    this.#id = id;
    this.#settings = settings;
  }

  get id(): string {
    return this.#id;
  }

  get settings(): SettingsType {
    return this.#settings;
  }

  protected static _entityName: string = "entity";

  async save() {
    await EntitiesController.updateEntity(
      (this.constructor as typeof StorageEntity)._entityName,
      this
    );
  }

  async delete() {
    await EntitiesController.deleteEntity(
      (this.constructor as typeof StorageEntity)._entityName,
      this.id
    );
  }

  static async readAll(): Promise<Array<any>> {
    throw new Error("Not implemented");
  }
}
