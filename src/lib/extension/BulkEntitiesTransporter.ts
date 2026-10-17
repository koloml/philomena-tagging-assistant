import type StorageEntity from "$lib/extension/base/StorageEntity";
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import type { ImportableElementsList, ImportableEntityObject } from "$lib/extension/transporting/importables";
import EntitiesTransporter, { type SameSiteStatus } from "$lib/extension/EntitiesTransporter";
import TaggingProfile from "$entities/TaggingProfile";
import TagGroup from "$entities/TagGroup";
import TagEditorPreset from "$entities/TagEditorPreset";

type TransportersMapping = {
  [EntityName in keyof App.EntityNamesMap]: EntitiesTransporter<App.EntityNamesMap[EntityName]>;
}

export default class BulkEntitiesTransporter {
  #lastSameSiteStatus: SameSiteStatus = null;

  get lastImportSameSiteStatus() {
    return this.#lastSameSiteStatus;
  }

  parseAndImportFromJSON(jsonString: string): StorageEntity[] {
    let parsedObject: any;

    this.#lastSameSiteStatus = null;

    try {
      parsedObject = JSON.parse(jsonString);
    } catch (e) {
      throw new TypeError('Invalid JSON!', {cause: e});
    }

    if (!BulkEntitiesTransporter.isList(parsedObject)) {
      throw new TypeError('Invalid or unsupported object!');
    }

    this.#lastSameSiteStatus = EntitiesTransporter.checkIsSameSiteImportedObject(parsedObject);

    let hasDifferentStatuses = false;

    const resultEntities = parsedObject.elements
      .map(importableObject => {
        if (!(importableObject.$type in BulkEntitiesTransporter.#transporters)) {
          console.warn('Attempting to import unsupported entity: ' + importableObject.$type);
          return null;
        }

        const transporter = BulkEntitiesTransporter.#transporters[importableObject.$type as keyof App.EntityNamesMap];
        const resultEntity = transporter.importFromObject(importableObject);

        if (transporter.lastImportSameSiteStatus !== this.#lastSameSiteStatus) {
          hasDifferentStatuses = true;
        }

        return resultEntity;
      })
      .filter(maybeEntity => !!maybeEntity);

    if (hasDifferentStatuses) {
      this.#lastSameSiteStatus = 'unknown';
    }

    return resultEntities;
  }

  parseAndImportFromCompressedJSON(compressedJsonString: string): StorageEntity[] {
    return this.parseAndImportFromJSON(
      decompressFromEncodedURIComponent(compressedJsonString)
    );
  }

  exportToJSON(entities: StorageEntity[]): string {
    return JSON.stringify({
      $type: 'list',
      $site: __CURRENT_SITE__,
      elements: entities
        .map(entity => {
          switch (true) {
            case entity instanceof TaggingProfile:
              return BulkEntitiesTransporter.#transporters.profiles.exportToObject(entity);
            case entity instanceof TagGroup:
              return BulkEntitiesTransporter.#transporters.groups.exportToObject(entity);
            case entity instanceof TagEditorPreset:
              return BulkEntitiesTransporter.#transporters.presets.exportToObject(entity);
          }

          return null;
        })
        .filter(value => !!value)
    } as ImportableElementsList<ImportableEntityObject<StorageEntity>>, null, 2);
  }

  exportToCompressedJSON(entities: StorageEntity[]): string {
    return compressToEncodedURIComponent(
      this.exportToJSON(entities)
    );
  }

  static isList(targetObject: any): targetObject is ImportableElementsList<ImportableEntityObject<StorageEntity>> {
    return targetObject.$type
      && targetObject.$type === 'list'
      && targetObject.elements
      && Array.isArray(targetObject.elements);
  }

  static readonly #transporters: TransportersMapping = {
    profiles: new EntitiesTransporter(TaggingProfile),
    groups: new EntitiesTransporter(TagGroup),
    presets: new EntitiesTransporter(TagEditorPreset),
  }

  /**
   * Check if the imported object is created for the same site extension or not.
   * @param importedObject Object to check.
   * @private
   */
  static #checkIsSameSiteImportedObject(importedObject: Record<string, any>): SameSiteStatus {
    if (!('$site' in importedObject)) {
      return "unknown";
    }

    return importedObject.$site === __CURRENT_SITE__
      ? "same"
      : "different";
  }
}
