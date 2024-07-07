import StorageEntity from "$lib/extension/base/StorageEntity.js";
import EntitiesController from "$lib/extension/EntitiesController.js";
import {compressToEncodedURIComponent, decompressFromEncodedURIComponent} from "lz-string";

/**
 * @typedef {Object} MaintenanceProfileSettings
 * @property {string} name
 * @property {string[]} tags
 */

/**
 * Class representing the maintenance profile entity.
 */
class MaintenanceProfile extends StorageEntity {
  /**
   * @param {string} id ID of the entity.
   * @param {Partial<MaintenanceProfileSettings>} settings Maintenance profile settings object.
   */
  constructor(id, settings) {
    super(id, {
      name: settings.name || '',
      tags: settings.tags || []
    });
  }

  /**
   * @return {MaintenanceProfileSettings}
   */
  get settings() {
    return super.settings;
  }

  /**
   * Export the profile to the formatted JSON.
   *
   * @type {string}
   */
  toJSON() {
    return JSON.stringify({
      v: 1,
      id: this.id,
      name: this.settings.name,
      tags: this.settings.tags,
    }, null, 2);
  }

  toCompressedJSON() {
    return compressToEncodedURIComponent(
      this.toJSON()
    );
  }

  static _entityName = "profiles";

  /**
   * Read all maintenance profiles from the storage.
   *
   * @return {Promise<InstanceType<MaintenanceProfile>[]>}
   */
  static async readAll() {
    return await EntitiesController.readAllEntities(
      this._entityName,
      MaintenanceProfile
    );
  }

  /**
   * Subscribe to the changes and receive the new list of profiles when they change.
   *
   * @param {function(MaintenanceProfile[]): void} callback Callback to call when the profiles change. The new list of
   * profiles is passed as an argument.
   *
   * @return {function(): void} Unsubscribe function.
   */
  static subscribe(callback) {
    return EntitiesController.subscribeToEntity(
      this._entityName,
      MaintenanceProfile,
      callback
    );
  }

  /**
   * Validate and import the profile from the JSON.
   * @param {string} exportedString JSON for profile.
   * @return {MaintenanceProfile} Maintenance profile imported from the JSON. Note that profile is not automatically
   * saved.
   * @throws {Error} When version is unsupported or format is invalid.
   */
  static importFromJSON(exportedString) {
    let importedObject;

    try {
      importedObject = JSON.parse(exportedString);
    } catch (e) {
      // Error will be sent later, since empty string could be parsed as nothing without raising the error.
    }

    if (!importedObject) {
      throw new Error('Invalid JSON!');
    }

    if (importedObject.v !== 1) {
      throw new Error('Unsupported version!');
    }

    if (
      !importedObject.id
      || typeof importedObject.id !== "string"
      || !importedObject.name
      || typeof importedObject.name !== "string"
      || !importedObject.tags
      || !Array.isArray(importedObject.tags)
    ) {
      throw new Error('Invalid profile format detected!');
    }

    return new MaintenanceProfile(
      importedObject.id,
      {
        name: importedObject.name,
        tags: importedObject.tags,
      }
    );
  }

  /**
   * Validate and import the profile from the compressed JSON string.
   * @param {string} compressedString
   * @return {MaintenanceProfile}
   * @throws {Error} When version is unsupported or format is invalid.
   */
  static importFromCompressedJSON(compressedString) {
    return this.importFromJSON(
      decompressFromEncodedURIComponent(compressedString)
    );
  }
}

export default MaintenanceProfile;
