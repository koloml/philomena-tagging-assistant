import { type Writable, writable } from "svelte/store";
import TagGroup from "$entities/TagGroup";

export const tagGroups: Writable<TagGroup[]> = writable([]);

TagGroup
  .readAll()
  .then(groups => tagGroups.set(groups))
  .then(() => {
    TagGroup.subscribe(groups => tagGroups.set(groups));
  });
