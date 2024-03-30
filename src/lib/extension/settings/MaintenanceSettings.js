import ConfigurationController from "$lib/extension/ConfigurationController.js";
import MaintenanceProfile from "$lib/extension/entities/MaintenanceProfile.js";

export default class MaintenanceSettings {
  #isInitialized = false;
  #activeProfileId = null;

  constructor() {
    void this.#initializeSettings();
  }

  async #initializeSettings() {
    MaintenanceSettings.#controller.subscribeToChanges(settings => {
      this.#activeProfileId = settings.activeProfile || null;
    });

    this.#activeProfileId = await MaintenanceSettings.#controller.readSetting("activeProfile", null);
    this.#isInitialized = true;
  }

  /**
   * Set the active maintenance profile.
   *
   * @return {Promise<string|null>}
   */
  async resolveActiveProfileId() {
    if (!this.#isInitialized && !this.#activeProfileId) {
      this.#activeProfileId = await MaintenanceSettings.#controller.readSetting(
        "activeProfile",
        null
      );
    }

    if (!this.#activeProfileId) {
      return null;
    }

    return this.#activeProfileId;
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
    this.#activeProfileId = profileId;

    await MaintenanceSettings.#controller.writeSetting("activeProfile", profileId);
  }

  /**
   * Controller for interaction with the settings stored in the extension's storage.
   *
   * @type {ConfigurationController}
   */
  static #controller = new ConfigurationController("maintenance");

  /**
   * Subscribe to the changes in the maintenance-related settings.
   *
   * @param {function({activeProfileId: string|null}): void} callback Callback to call when the settings change. The new settings are
   * passed as an argument.
   *
   * @return {function(): void} Unsubscribe function.
   */
  static subscribe(callback) {
    return MaintenanceSettings.#controller.subscribeToChanges(settings => {
      callback({
        activeProfileId: settings.activeProfile || null,
      });
    });
  }
}
