/**
 * Build the map containing both real tags and their aliases.
 *
 * @param {string[]} realAndAliasedTags List combining aliases and tag names.
 * @param {string[]} realTags List of actual tag names, excluding aliases.
 *
 * @return {Map<string, string>} Map where key is a tag or alias and value is an actual tag name.
 */
export function buildTagsAndAliasesMap(realAndAliasedTags, realTags) {
  /** @type {Map<string, string>} */
  const tagsAndAliasesMap = new Map();

  for (let tagName of realTags) {
    tagsAndAliasesMap.set(tagName, tagName);
  }

  let realTagName = null;

  for (let tagNameOrAlias of realAndAliasedTags) {
    if (tagsAndAliasesMap.has(tagNameOrAlias)) {
      realTagName = tagNameOrAlias;
      continue;
    }

    if (!realTagName) {
      console.warn('No real tag found for the alias:', tagNameOrAlias);
      continue;
    }

    tagsAndAliasesMap.set(tagNameOrAlias, realTagName);
  }

  return tagsAndAliasesMap;
}
