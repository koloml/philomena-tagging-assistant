import CacheableSettings from "$lib/extension/base/CacheableSettings.ts";

export type FullscreenViewerSize = 'small' | 'medium' | 'large' | 'full';

interface MiscSettingsFields {
  fullscreenViewer: boolean;
  fullscreenViewerSize: FullscreenViewerSize;
}

export default class MiscSettings extends CacheableSettings<MiscSettingsFields> {
  constructor() {
    super("misc");
  }

  async resolveFullscreenViewerEnabled() {
    return this._resolveSetting("fullscreenViewer", true);
  }

  async resolveFullscreenViewerPreviewSize() {
    return this._resolveSetting('fullscreenViewerSize', 'large');
  }

  async setFullscreenViewerEnabled(isEnabled: boolean) {
    return this._writeSetting("fullscreenViewer", isEnabled);
  }

  async setFullscreenViewerPreviewSize(size: FullscreenViewerSize | string) {
    return this._writeSetting('fullscreenViewerSize', size as FullscreenViewerSize);
  }
}
