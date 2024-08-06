import CacheableSettings from "$lib/extension/base/CacheableSettings.js";

export default class SearchSettings extends CacheableSettings {
  constructor() {
    super("search");
  }

  async resolvePropertiesSuggestionsEnabled() {
    return this._resolveSetting("suggestProperties", false);
  }

  async resolvePropertiesSuggestionsPosition() {
    return this._resolveSetting("suggestPropertiesPosition", "start");
  }

  async setPropertiesSuggestions(isEnabled) {
    return this._writeSetting("suggestProperties", isEnabled);
  }

  async setPropertiesSuggestionsPosition(position) {
    return this._writeSetting("suggestPropertiesPosition", position);
  }

  /**
   * @param {function(SearchSettingsObject): void} callback
   * @return {function(): void}
   */
  subscribe(callback) {
    return super.subscribe(rawSettings => {
      callback({
        suggestProperties: rawSettings.suggestProperties ?? false,
        suggestPropertiesPosition: rawSettings.suggestPropertiesPosition ?? "start",
      });
    });
  }
}

/**
 * @typedef {Object} SearchSettingsObject
 * @property {boolean} suggestProperties
 * @property {"start"|"end"} suggestPropertiesPosition
 */
