import { writable } from "svelte/store";
import TagsPreferences from "$lib/extension/preferences/TagsPreferences";
import { PreferenceSync } from "$lib/store-sync";

const preferences = new TagsPreferences();

export const shouldSeparateTagGroups = writable(false);
export const shouldReplaceLinksOnForumPosts = writable(false);
export const shouldReplaceTextOfTagLinks = writable(true);

void PreferenceSync.for(preferences)
  .connect(preferences.groupSeparation, shouldSeparateTagGroups, {updateToStore: Boolean})
  .connect(preferences.replaceLinks, shouldReplaceLinksOnForumPosts, {updateToStore: Boolean})
  .connect(preferences.replaceLinkText, shouldReplaceTextOfTagLinks, {updateToStore: Boolean})
  .startSync();
