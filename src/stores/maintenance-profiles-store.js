import { writable } from "svelte/store";
import MaintenanceProfile from "$entities/MaintenanceProfile";
import MaintenanceSettings from "$lib/extension/settings/MaintenanceSettings";

/**
 * Store for working with maintenance profiles in the Svelte popup.
 *
 * @type {import('svelte/store').Writable<MaintenanceProfile[]>}
 */
export const maintenanceProfilesStore = writable([]);

/**
 * Store for the active maintenance profile ID.
 *
 * @type {import('svelte/store').Writable<string|null>}
 */
export const activeProfileStore = writable(null);

const maintenanceSettings = new MaintenanceSettings();

/**
 * Active profile ID stored locally. Used to reset active profile once the existing profile was removed.
 * @type {string|null}
 */
let lastActiveProfileId = null;

Promise.allSettled([
  // Read the initial values from the storages first
  MaintenanceProfile.readAll().then(profiles => {
    maintenanceProfilesStore.set(profiles);
  }),
  maintenanceSettings.resolveActiveProfileId().then(activeProfileId => {
    activeProfileStore.set(activeProfileId);
  })
]).then(() => {
  // And only after initial values are loaded, start watching for changes from storage and from user's interaction
  MaintenanceProfile.subscribe(profiles => {
    maintenanceProfilesStore.set(profiles);
  });

  maintenanceSettings.subscribe(settings => {
    activeProfileStore.set(settings.activeProfile || null);
  });

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
});
