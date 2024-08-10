import {writable} from "svelte/store";
import MiscSettings from "$lib/extension/settings/MiscSettings.js";

export const fullScreenViewerEnabled = writable(true);

const miscSettings = new MiscSettings();

Promise.allSettled([
  miscSettings.resolveFullscreenViewerEnabled().then(v => fullScreenViewerEnabled.set(v))
]).then(() => {
  fullScreenViewerEnabled.subscribe(value => {
    void miscSettings.setFullscreenViewerEnabled(value);
  })
});
