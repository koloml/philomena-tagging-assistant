import StorageEntity from "$lib/extension/base/StorageEntity.ts";
import EntitiesController from "$lib/extension/EntitiesController.ts";

export interface MaintenanceProfileSettings {
  name: string;
  tags: string[];
}

/**
 * Class representing the maintenance profile entity.
 */
export default class MaintenanceProfile extends StorageEntity<MaintenanceProfileSettings> {
  /**
   * @param id ID of the entity.
   * @param settings Maintenance profile settings object.
   */
  constructor(id: string, settings: Partial<MaintenanceProfileSettings>) {
    super(id, {
      name: settings.name || '',
      tags: settings.tags || []
    });
  }

  public static readonly _entityName = "profiles";

  /**
   * Subscribe to the changes and receive the new list of profiles when they change.
   *
   * @param callback Callback to call when the profiles change. The new list of profiles is passed as an argument.
   *
   * @return Unsubscribe function.
   */
  static subscribe(callback: (profiles: MaintenanceProfile[]) => void): () => void {
    return EntitiesController.subscribeToEntity(
      this._entityName,
      MaintenanceProfile,
      callback
    );
  }
}
