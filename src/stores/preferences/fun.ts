import FunPreferences from "$lib/extension/preferences/FunPreferences";
import { PreferenceSync } from "$lib/store-sync";
import { writable } from "svelte/store";

export const useAvaliFont = writable<boolean>(false);

const preferences = new FunPreferences();

void PreferenceSync.for(preferences)
  .connect(preferences.useAvaliFont, useAvaliFont, {updateToStore: Boolean})
  .startSync()
