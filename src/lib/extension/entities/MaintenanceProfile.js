import StorageEntity from "$lib/extension/base/StorageEntity.js";
import EntitiesController from "$lib/extension/EntitiesController.js";

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
}

export default MaintenanceProfile;
