import {validateImportedEntity} from "$lib/extension/transporting/validators.js";
import {exportEntityToObject} from "$lib/extension/transporting/exporters.js";
import StorageEntity from "./base/StorageEntity.js";
import {compressToEncodedURIComponent, decompressFromEncodedURIComponent} from "lz-string";

type EntityConstructor<T extends StorageEntity> =
  (new (id: string, settings: Record<string, any>) => T)
  & typeof StorageEntity;

export default class EntitiesTransporter<EntityType extends StorageEntity> {
  readonly #targetEntityConstructor: EntityConstructor<EntityType>;

  constructor(entityConstructor: EntityConstructor<EntityType>) {
    this.#targetEntityConstructor = entityConstructor;
  }

  importFromJSON(jsonString: string): EntityType {
    const importedObject = this.#tryParsingAsJSON(jsonString);

    if (!importedObject) {
      throw new Error('Invalid JSON!');
    }

    validateImportedEntity(
      importedObject,
      this.#targetEntityConstructor._entityName
    );

    return new this.#targetEntityConstructor(
      importedObject.id,
      importedObject
    );
  }

  importFromCompressedJSON(compressedJsonString: string): EntityType {
    return this.importFromJSON(
      decompressFromEncodedURIComponent(compressedJsonString)
    )
  }

  exportToJSON(entityObject: EntityType): string {
    if (!(entityObject instanceof this.#targetEntityConstructor)) {
      throw new TypeError('Transporter should be connected to the same entity to export!');
    }

    const exportableObject = exportEntityToObject(
      entityObject,
      this.#targetEntityConstructor._entityName
    );

    return JSON.stringify(exportableObject, null, 2);
  }

  exportToCompressedJSON(entityObject: EntityType): string {
    return compressToEncodedURIComponent(this.exportToJSON(entityObject));
  }

  #tryParsingAsJSON(jsonString: string): Record<string, any> | null {
    let jsonObject: Record<string, any> | null = null;

    try {
      jsonObject = JSON.parse(jsonString);
    } catch (e) {

    }

    if (typeof jsonObject !== "object") {
      throw new TypeError("Should be an object!");
    }

    return jsonObject
  }
}
