import {writable} from "svelte/store";

export const searchPropertiesSuggestionsEnabled = writable(false);

/** @type {import('svelte').Writable<"start"|"end">} */
export const searchPropertiesSuggestionsPosition = writable('start');
