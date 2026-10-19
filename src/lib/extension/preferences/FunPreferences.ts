import CacheablePreferences, { PreferenceField, type WithFields } from "$lib/extension/base/CacheablePreferences";

interface FunPreferencesFields {
  useAvaliFont: boolean;
}

export default class FunPreferences extends CacheablePreferences<FunPreferencesFields> implements WithFields<FunPreferencesFields> {
  constructor() {
    super('fun');
  }

  readonly useAvaliFont = new PreferenceField(this, {
    field: "useAvaliFont",
    defaultValue: false,
  });
}
