import { type Writable, writable } from "svelte/store";
import SearchSettings, { type SuggestionsPosition } from "$lib/extension/settings/SearchSettings";

export const searchPropertiesSuggestionsEnabled = writable(false);

export const searchPropertiesSuggestionsPosition: Writable<SuggestionsPosition> = writable('start');

const searchSettings = new SearchSettings();

Promise.allSettled([
  // First we wait for all properties to load and save
  searchSettings.resolvePropertiesSuggestionsEnabled().then(v => searchPropertiesSuggestionsEnabled.set(v)),
  searchSettings.resolvePropertiesSuggestionsPosition().then(v => searchPropertiesSuggestionsPosition.set(v))
]).then(() => {
  // And then we can start reading value changes from the writable objects
  searchPropertiesSuggestionsEnabled.subscribe(value => {
    void searchSettings.setPropertiesSuggestions(value);
  });

  searchPropertiesSuggestionsPosition.subscribe(value => {
    void searchSettings.setPropertiesSuggestionsPosition(value);
  });

  searchSettings.subscribe(settings => {
    searchPropertiesSuggestionsEnabled.set(Boolean(settings.suggestProperties));
    searchPropertiesSuggestionsPosition.set(settings.suggestPropertiesPosition || 'start');
  });
})
