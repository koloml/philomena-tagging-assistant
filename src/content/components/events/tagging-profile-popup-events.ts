import type TaggingProfile from "$entities/TaggingProfile";

export const EVENT_ACTIVE_PROFILE_CHANGED = 'active-profile-changed';
export const EVENT_PROFILE_POPUP_STATE_CHANGED = 'maintenance-state-change';
export const EVENT_TAGS_UPDATED = 'tags-updated';

export type ProfilePopupState = 'ready' | 'processing' | 'failed' | 'complete' | 'waiting';

export interface TaggingProfilePopupEventsMap {
  [EVENT_ACTIVE_PROFILE_CHANGED]: TaggingProfile | null;
  [EVENT_PROFILE_POPUP_STATE_CHANGED]: ProfilePopupState;
  [EVENT_TAGS_UPDATED]: Map<string, string> | null;
}
