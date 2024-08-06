import ConfigurationController from "$lib/extension/ConfigurationController.js";
import MaintenanceProfile from "$lib/extension/entities/MaintenanceProfile.js";
import CacheableSettings from "$lib/extension/base/CacheableSettings.js";

export default class MaintenanceSettings extends CacheableSettings {
  constructor() {
    super("maintenance");
  }

  /**
   * Set the active maintenance profile.
   *
   * @return {Promise<string|null>}
   */
  async resolveActiveProfileId() {
    return this._resolveSetting("activeProfile", null);
  }

  /**
   * Get the active maintenance profile if it is set.
   *
   * @return {Promise<MaintenanceProfile|null>}
   */
  async resolveActiveProfileAsObject() {
    const resolvedProfileId = await this.resolveActiveProfileId();

    return (await MaintenanceProfile.readAll())
      .find(profile => profile.id === resolvedProfileId) || null;
  }

  /**
   * Set the active maintenance profile.
   *
   * @param {string|null} profileId ID of the profile to set as active. If `null`, the active profile will be considered
   * unset.
   *
   * @return {Promise<void>}
   */
  async setActiveProfileId(profileId) {
    await this._writeSetting("activeProfile", profileId);
  }

  /**
   * Subscribe to the changes in the maintenance-related settings.
   *
   * @param {function(MaintenanceSettingsObject): void} callback Callback to call when the settings change. The new
   * settings are passed as an argument.
   *
   * @return {function(): void} Unsubscribe function.
   */
  subscribe(callback) {
    return super.subscribe(settings => {
      callback({
        activeProfile: settings.activeProfile || null,
      });
    });
  }
}

/**
 * @typedef {Object} MaintenanceSettingsObject
 * @property {string|null} activeProfile
 */
