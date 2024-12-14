import {writable} from "svelte/store";
import MaintenanceSettings from "$lib/extension/settings/MaintenanceSettings.ts";

export const stripBlacklistedTagsEnabled = writable(true);

const maintenanceSettings = new MaintenanceSettings();

Promise
  .all([
    maintenanceSettings.resolveStripBlacklistedTags().then(v => stripBlacklistedTagsEnabled.set(v ?? true))
  ])
  .then(() => {
    maintenanceSettings.subscribe(settings => {
      stripBlacklistedTagsEnabled.set(typeof settings.stripBlacklistedTags === 'boolean' ? settings.stripBlacklistedTags : true);
    });

    stripBlacklistedTagsEnabled.subscribe(v => maintenanceSettings.setStripBlacklistedTags(v));
  });
