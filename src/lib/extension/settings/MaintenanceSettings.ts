import MaintenanceProfile from "$entities/MaintenanceProfile.ts";
import CacheableSettings from "$lib/extension/base/CacheableSettings.ts";

interface MaintenanceSettingsFields {
  activeProfile: string | null;
  stripBlacklistedTags: boolean;
}

export default class MaintenanceSettings extends CacheableSettings<MaintenanceSettingsFields> {
  constructor() {
    super("maintenance");
  }

  /**
   * Set the active maintenance profile.
   */
  async resolveActiveProfileId() {
    return this._resolveSetting("activeProfile", null);
  }

  /**
   * Get the active maintenance profile if it is set.
   */
  async resolveActiveProfileAsObject(): Promise<MaintenanceProfile | null> {
    const resolvedProfileId = await this.resolveActiveProfileId();

    return (await MaintenanceProfile.readAll())
      .find(profile => profile.id === resolvedProfileId) || null;
  }

  async resolveStripBlacklistedTags() {
    return this._resolveSetting('stripBlacklistedTags', false);
  }

  /**
   * Set the active maintenance profile.
   *
   * @param profileId ID of the profile to set as active. If `null`, the active profile will be considered
   * unset.
   */
  async setActiveProfileId(profileId: string | null): Promise<void> {
    await this._writeSetting("activeProfile", profileId);
  }

  async setStripBlacklistedTags(isEnabled: boolean) {
    await this._writeSetting('stripBlacklistedTags', isEnabled);
  }
}
