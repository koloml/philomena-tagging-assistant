/**
 * List of categories defined by the sites.
 */
export const categories: string[] = [
  'rating',
  'spoiler',
  'origin',
  'oc',
  'error',
  'character',
  'content-official',
  'content-fanmade',
  'species',
  'body-type',
];

/**
 * Mapping of namespaces to their respective categories. These namespaces are automatically assigned to them, so we can
 * automatically assume categories of tags which start with them. Mapping is extracted from Philomena directly.
 *
 * This mapping may differ between boorus.
 *
 * @see https://github.com/philomena-dev/philomena/blob/6086757b654da8792ae52adb2a2f501ea6c30d12/lib/philomena/tags/tag.ex#L33-L45
 */
export const namespaceCategories: Map<string, string> = new Map([
  ['artist', 'origin'],
  ['art pack', 'content-fanmade'],
  ['colorist', 'origin'],
  ['comic', 'content-fanmade'],
  ['editor', 'origin'],
  ['fanfic', 'content-fanmade'],
  ['oc', 'oc'],
  ['photographer', 'origin'],
  ['series', 'content-fanmade'],
  ['spoiler', 'spoiler'],
  ['video', 'content-fanmade'],
  ...(__CURRENT_SITE__ === 'tantabus' ? <const> [
    ["prompter", "origin"],
    ["creator", "origin"],
    ["generator", "origin"]
  ] : [])
]);

/**
 * List of tags which marked by the site as blacklisted. These tags are blocked from being added by the tag editor and
 * should usually just be removed automatically.
 */
export const tagsBlacklist: string[] = (__CURRENT_SITE__ === 'furbooru' ? [
  "anthro art",
  "anthro artist",
  "anthro cute",
  "anthro furry",
  "anthro nsfw",
  "anthro oc",
  "anthroart",
  "anthroartist",
  "anthrofurry",
  "anthronsfw",
  "anthrooc",
  "art",
  "artist",
  "artwork",
  "cringe",
  "cringeworthy",
  "cute art",
  "cute artwork",
  "cute furry",
  "downvotes galore",
  "drama in comments",
  "drama in the comments",
  "fandom",
  "furries",
  "furry anthro",
  "furry art",
  "furry artist",
  "furry artwork",
  "furry character",
  "furry community",
  "furry cute",
  "furry fandom",
  "furry nsfw",
  "furry oc",
  "furryanthro",
  "furryart",
  "furryartist",
  "furryartwork",
  "furrynsfw",
  "furryoc",
  "image",
  "no tag",
  "not tagged",
  "notag",
  "notags",
  "nsfw anthro",
  "nsfw art",
  "nsfw artist",
  "nsfw artwork",
  "nsfw",
  "nsfwanthro",
  "nsfwart",
  "nsfwartist",
  "nsfwartwork",
  "paywall",
  "rcf community",
  "sfw",
  "solo oc",
  "tag me",
  "tag needed",
  "tag your shit",
  "tagme",
  "upvotes galore",
  "wall of faves"
] : [
  "tagme",
  "tag me",
  "not tagged",
  "no tag",
  "notag",
  "notags",
  "upvotes galore",
  "downvotes galore",
  "wall of faves",
  "drama in the comments",
  "drama in comments",
  "tag needed",
  "paywall",
  "cringeworthy",
  "solo oc",
  "tag your shit"
]);

/**
 * Core rating tags used in the Philomena. These rarely change, so they're pretty safe to hardcode into the source code.
 */
export const ratingTags: string[] = [
  'safe',
  'suggestive',
  'questionable',
  'explicit',
  'grimdark',
  'grotesque',
];
