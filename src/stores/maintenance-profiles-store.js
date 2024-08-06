import {writable} from "svelte/store";
import MaintenanceProfile from "$lib/extension/entities/MaintenanceProfile.js";
import MaintenanceSettings from "$lib/extension/settings/MaintenanceSettings.js";

/**
 * Store for working with maintenance profiles in the Svelte popup.
 *
 * @type {import('svelte/store').Writable<MaintenanceProfile[]>}
 */
export const maintenanceProfilesStore = writable([]);

MaintenanceProfile.readAll().then(profiles => {
  maintenanceProfilesStore.set(profiles);
});

MaintenanceProfile.subscribe(profiles => {
  maintenanceProfilesStore.set(profiles);
});

/**
 * Store for the active maintenance profile ID.
 *
 * @type {import('svelte/store').Writable<string|null>}
 */
export const activeProfileStore = writable(null);

const maintenanceSettings = new MaintenanceSettings();

maintenanceSettings.resolveActiveProfileId().then(activeProfileId => {
  activeProfileStore.set(activeProfileId);
});

maintenanceSettings.subscribe(settings => {
  activeProfileStore.set(settings.activeProfile || null);
});

/**
 * Active profile ID stored locally. Used to reset active profile once the existing profile was removed.
 * @type {string|null}
 */
let lastActiveProfileId = null;

activeProfileStore.subscribe(profileId => {
  lastActiveProfileId = profileId;

  void maintenanceSettings.setActiveProfileId(profileId);
});

// Watch the existence of the active profile on every change.
MaintenanceProfile.subscribe(profiles => {
  if (!profiles.find(profile => profile.id === lastActiveProfileId)) {
    activeProfileStore.set(null);
  }
});
