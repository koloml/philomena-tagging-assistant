import EntitiesController from "$lib/extension/EntitiesController";

export default abstract class StorageEntity<SettingsType extends Object = {}> {
  /**
   * @type {string}
   */
  readonly #id: string;

  /**
   * @type {Object}
   */
  readonly #settings: SettingsType;

  protected constructor(id: string, settings: SettingsType) {
    this.#id = id;
    this.#settings = settings;
  }

  get id(): string {
    return this.#id;
  }

  get settings(): SettingsType {
    return this.#settings;
  }

  public static readonly _entityName: string = "entity";

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

  public static async readAll<Type extends StorageEntity<any>>(this: new (...args: any[]) => Type): Promise<Type[]> {
    return await EntitiesController.readAllEntities(
      // Voodoo magic, once again.
      ((this as any) as typeof StorageEntity)._entityName,
      this
    )
  }

  public static subscribe<Type extends StorageEntity<any>>(this: new (...args: any[]) => Type, callback: (entities: Type[]) => void): () => void {
    return EntitiesController.subscribeToEntity(
      // And once more.
      ((this as any) as typeof StorageEntity)._entityName,
      this,
      callback
    );
  }
}
