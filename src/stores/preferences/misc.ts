import { writable } from "svelte/store";
import MiscPreferences from "$lib/extension/preferences/MiscPreferences";
import { PreferenceSync } from "$lib/store-sync";

export const fullScreenViewerEnabled = writable(true);

const preferences = new MiscPreferences();

void PreferenceSync.for(preferences)
  .connect(preferences.fullscreenViewer, fullScreenViewerEnabled, {updateToStore: Boolean})
  .startSync();
