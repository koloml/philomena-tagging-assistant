import type MaintenanceProfile from "$entities/MaintenanceProfile.ts";

export const eventActiveProfileChanged = 'active-profile-changed';
export const eventMaintenanceStateChanged = 'maintenance-state-change';
export const eventTagsUpdated = 'tags-updated';

type MaintenanceState = 'processing' | 'failed' | 'complete' | 'waiting';

export interface MaintenancePopupEventsMap {
  [eventActiveProfileChanged]: MaintenanceProfile | null;
  [eventMaintenanceStateChanged]: MaintenanceState;
  [eventTagsUpdated]: Map<string, string> | null;
}
