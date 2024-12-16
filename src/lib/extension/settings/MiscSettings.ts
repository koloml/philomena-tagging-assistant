import CacheableSettings from "$lib/extension/base/CacheableSettings.ts";

interface MiscSettingsFields {
  fullscreenViewer: boolean;
}

export default class MiscSettings extends CacheableSettings<MiscSettingsFields> {
  constructor() {
    super("misc");
  }

  async resolveFullscreenViewerEnabled() {
    return this._resolveSetting("fullscreenViewer", true);
  }

  async setFullscreenViewerEnabled(isEnabled: boolean) {
    return this._writeSetting("fullscreenViewer", isEnabled);
  }
}
