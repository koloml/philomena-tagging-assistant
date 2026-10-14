import { writable } from "svelte/store";
import TaggingProfilesPreferences from "$lib/extension/preferences/TaggingProfilesPreferences";
import { PreferenceSync } from "$lib/store-sync";

export const stripBlacklistedTagsEnabled = writable(true);

const preferences = new TaggingProfilesPreferences();

void PreferenceSync.for(preferences)
  .connect(preferences.stripBlacklistedTags, stripBlacklistedTagsEnabled, {
    updateToStore: maybeBoolean => typeof maybeBoolean === 'boolean' ? maybeBoolean : true,
  })
  .startSync();
