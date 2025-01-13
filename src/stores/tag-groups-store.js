import {writable} from "svelte/store";
import TagGroup from "$entities/TagGroup.ts";

/** @type {import('svelte/store').Writable<TagGroup[]>} */
export const tagGroupsStore = writable([]);

TagGroup
  .readAll()
  .then(groups => tagGroupsStore.set(groups))
  .then(() => {
    TagGroup.subscribe(groups => tagGroupsStore.set(groups));
  });
