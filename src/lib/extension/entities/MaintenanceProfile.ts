import StorageEntity from "$lib/extension/base/StorageEntity";

export interface MaintenanceProfileSettings {
  name: string;
  tags: string[];
  temporary: boolean;
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
      tags: settings.tags || [],
      temporary: settings.temporary ?? false
    });
  }

  async save(): Promise<void> {
    if (this.settings.temporary && !this.settings.tags?.length) {
      return this.delete();
    }

    return super.save();
  }

  public static readonly _entityName = "profiles";
}
