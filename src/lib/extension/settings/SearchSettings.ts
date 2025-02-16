import CacheableSettings from "$lib/extension/base/CacheableSettings";

export type SuggestionsPosition = "start" | "end";

interface SearchSettingsFields {
  suggestProperties: boolean;
  suggestPropertiesPosition: SuggestionsPosition;
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
