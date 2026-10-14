export const EVENT_TAG_TOGGLED = 'tag-toggled';

export interface TagsListTogglerEventsMap {
  [EVENT_TAG_TOGGLED]: [string, boolean];
}
