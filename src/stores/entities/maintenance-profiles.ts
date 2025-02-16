import { type Writable, writable } from "svelte/store";
import MaintenanceProfile from "$entities/MaintenanceProfile";
import MaintenanceSettings from "$lib/extension/settings/MaintenanceSettings";

/**
 * Store for working with maintenance profiles in the Svelte popup.
 */
export const maintenanceProfiles: Writable<MaintenanceProfile[]> = writable([]);

/**
 * Store for the active maintenance profile ID.
 */
export const activeProfileStore: Writable<string|null> = writable(null);

const maintenanceSettings = new MaintenanceSettings();

/**
 * Active profile ID stored locally. Used to reset active profile once the existing profile was removed.
 */
let lastActiveProfileId: string|null = null;

Promise.allSettled([
  // Read the initial values from the storages first
  MaintenanceProfile.readAll().then(profiles => {
    maintenanceProfiles.set(profiles);
  }),
  maintenanceSettings.resolveActiveProfileId().then(activeProfileId => {
    activeProfileStore.set(activeProfileId);
  })
]).then(() => {
  // And only after initial values are loaded, start watching for changes from storage and from user's interaction
  MaintenanceProfile.subscribe(profiles => {
    maintenanceProfiles.set(profiles);
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
