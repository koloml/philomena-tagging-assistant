import CacheableSettings from "$lib/extension/base/CacheableSettings";

interface SearchSettingsFields {
  suggestProperties: boolean;
  suggestPropertiesPosition: "start" | "end";
}

export default class SearchSettings extends CacheableSettings<SearchSettingsFields> {
  constructor() {
    super("search");
  }

  async resolvePropertiesSuggestionsEnabled() {
    return this._resolveSetting("suggestProperties", false);
  }

  async resolvePropertiesSuggestionsPosition() {
    return this._resolveSetting("suggestPropertiesPosition", "start");
  }

  async setPropertiesSuggestions(isEnabled: boolean) {
    return this._writeSetting("suggestProperties", isEnabled);
  }

  async setPropertiesSuggestionsPosition(position: "start" | "end") {
    return this._writeSetting("suggestPropertiesPosition", position);
  }
}
