/**
 * Build the map containing both real tags and their aliases.
 *
 * @param realAndAliasedTags List combining aliases and tag names.
 * @param realTags List of actual tag names, excluding aliases.
 *
 * @return Map where key is a tag or alias and value is an actual tag name.
 */
export function buildTagsAndAliasesMap(realAndAliasedTags: string[], realTags: string[]): Map<string, string> {
  const tagsAndAliasesMap: Map<string, string> = new Map();

  for (const tagName of realTags) {
    tagsAndAliasesMap.set(tagName, tagName);
  }

  let realTagName: string | null = null;

  for (const tagNameOrAlias of realAndAliasedTags) {
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
