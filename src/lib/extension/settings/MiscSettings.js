import CacheableSettings from "$lib/extension/base/CacheableSettings.js";

export default class MiscSettings extends CacheableSettings {
  constructor() {
    super("misc");
  }

  async resolveFullscreenViewerEnabled() {
    return this._resolveSetting("fullscreenViewer", true);
  }

  async setFullscreenViewerEnabled(isEnabled) {
    return this._writeSetting("fullscreenViewer", isEnabled);
  }

  /**
   * @param {function(MiscSettingsObject): void} callback
   * @return {function(): void}
   */
  subscribe(callback) {
    return super.subscribe(settings => {
      callback({
        fullscreenViewer: settings.fullscreenViewer ?? true,
      })
    });
  }
}

/**
 * @typedef {Object} MiscSettingsObject
 * @property {boolean} fullscreenViewer
 */
