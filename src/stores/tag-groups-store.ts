import { type Writable, writable } from "svelte/store";
import TagGroup from "$entities/TagGroup";

export const tagGroupsStore: Writable<TagGroup[]> = writable([]);

TagGroup
  .readAll()
  .then(groups => tagGroupsStore.set(groups))
  .then(() => {
    TagGroup.subscribe(groups => tagGroupsStore.set(groups));
  });
