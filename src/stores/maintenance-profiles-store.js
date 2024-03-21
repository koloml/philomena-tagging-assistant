import {writable} from "svelte/store";
import MaintenanceProfile from "$lib/extension/entities/MaintenanceProfile.js";

/** @type {import('svelte/store').Writable<MaintenanceProfile[]>} */
export const maintenanceProfilesStore = writable([]);

MaintenanceProfile.readAll().then(profiles => {
  maintenanceProfilesStore.set(profiles);
});

MaintenanceProfile.subscribe(profiles => {
  maintenanceProfilesStore.set(profiles);
});