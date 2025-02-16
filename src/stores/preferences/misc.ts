import { writable } from "svelte/store";
import MiscSettings from "$lib/extension/settings/MiscSettings";

export const fullScreenViewerEnabled = writable(true);

const miscSettings = new MiscSettings();

Promise.allSettled([
  miscSettings.resolveFullscreenViewerEnabled().then(v => fullScreenViewerEnabled.set(v))
]).then(() => {
  fullScreenViewerEnabled.subscribe(value => {
    void miscSettings.setFullscreenViewerEnabled(value);
  });

  miscSettings.subscribe(settings => {
    fullScreenViewerEnabled.set(Boolean(settings.fullscreenViewer));
  });
});
