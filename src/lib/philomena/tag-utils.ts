import { namespaceCategories } from "$config/tags";
import { QueryLexer, QuotedTermToken, TermToken } from "$lib/philomena/search/QueryLexer";

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

const tagLinkRegExp = /\/tags\/(?<encodedTagName>[^/?#]+)/;

/**
 * List of encoded characters from Philomena.
 *
 * @see https://github.com/philomena-dev/philomena/blob/6086757b654da8792ae52adb2a2f501ea6c30d12/lib/philomena/slug.ex#L52-L57
 */
export const slugEncodedCharacters: Map<string, string> = new Map([
  ['-dash-', '-'],
  ['-fwslash-', '/'],
  ['-bwslash-', '\\'],
  ['-colon-', ':'],
  ['-dot-', '.'],
  ['-plus-', '+'],
]);

/**
 * Try to parse the tag name from the search query URL. It uses the same tokenizer as the booru. It only returns the
 * tag name if query contains only one single tag without any additional conditions.
 *
 * @param searchLink Link with search query.
 *
 * @return Tag name or NULL if query contains more than 1 tag or doesn't have any tags at all.
 */
function parseTagNameFromSearchQuery(searchLink: URL): string | null {
  const lexer = new QueryLexer(searchLink.searchParams.get('q') || '');
  const parsedQuery = lexer.parse();

  if (parsedQuery.length !== 1) {
    return null;
  }

  const [token] = parsedQuery;

  switch (true) {
    case token instanceof TermToken:
      return token.value;
    case token instanceof QuotedTermToken:
      return token.decodedValue;
  }

  return null;
}

/**
 * Decode the tag name from the following link.
 *
 * @param tagLink Search link or link to the tag to parse the tag name from.
 *
 * @return Tag name or NULL if function is failed to parse the name of the tag.
 */
export function resolveTagNameFromLink(tagLink: URL): string | null {
  if (tagLink.pathname.startsWith('/search') && tagLink.searchParams.has('q')) {
    return parseTagNameFromSearchQuery(tagLink);
  }

  tagLinkRegExp.lastIndex = 0;

  const result = tagLinkRegExp.exec(tagLink.pathname);
  const encodedTagName = result?.groups?.encodedTagName;

  if (!encodedTagName) {
    return null;
  }

  return decodeURIComponent(encodedTagName)
    .replaceAll('+', ' ')
    .replaceAll(/-[a-z]+-/gi, match => slugEncodedCharacters.get(match) ?? match);
}

/**
 * Try to resolve the category from the tag name.
 *
 * @param tagName Name of the tag.
 */
export function resolveTagCategoryFromTagName(tagName: string): string | null {
  const namespace = tagName.split(':')[0];

  return namespaceCategories.get(namespace) ?? null;
}
