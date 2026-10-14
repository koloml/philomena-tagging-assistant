import { URL } from 'url';
import {
  buildTagsAndAliasesMap,
  resolveTagCategoryFromTagName,
  resolveTagNameFromLink,
  slugEncodedCharacters
} from '$lib/philomena/tag-utils';
import { randomString } from "$tests/utils";
import { namespaceCategories } from "$config/tags";

const origin = 'https://furbooru.org';

describe('buildTagsAndAliasesMap', () => {
  it('should return regular tags if both real and real+alias tags are the same', () => {
    const tagsAndAliases = ['avali', 'experiment (casualties unknown)', 'fictional species'];

    expect(buildTagsAndAliasesMap(tagsAndAliases, tagsAndAliases)).toMatchInlineSnapshot(`
      Map {
        "avali" => "avali",
        "experiment (casualties unknown)" => "experiment (casualties unknown)",
        "fictional species" => "fictional species",
      }
    `);
  });

  it('should identify any aliases going after the real tag', () => {
    const realTags = ['avali', 'experiment (casualties unknown)', 'fictional species'];
    const realAndAliasesTags = ['avali', 'experiment (casualties unknown)', 'experiment (gunsaw)', 'fictional species'];

    expect(buildTagsAndAliasesMap(realAndAliasesTags, realTags)).toMatchInlineSnapshot(`
      Map {
        "avali" => "avali",
        "experiment (casualties unknown)" => "experiment (casualties unknown)",
        "fictional species" => "fictional species",
        "experiment (gunsaw)" => "experiment (casualties unknown)",
      }
    `);
  });

  it('should ignore any non-real tags coming before first tag is found', () => {
    const outOfOrderTag = randomString();

    const realTags = ['avali', 'experiment (casualties unknown)', 'fictional species'];
    const realAndAliasesTags = [outOfOrderTag, 'avali', 'experiment (casualties unknown)', 'experiment (gunsaw)', 'fictional species'];

    const warn = vi.spyOn(console, 'warn');

    expect(buildTagsAndAliasesMap(realAndAliasesTags, realTags)).toMatchInlineSnapshot(`
      Map {
        "avali" => "avali",
        "experiment (casualties unknown)" => "experiment (casualties unknown)",
        "fictional species" => "fictional species",
        "experiment (gunsaw)" => "experiment (casualties unknown)",
      }
    `);

    expect(warn).toHaveBeenCalledWith(`No real tag found for the alias:`, outOfOrderTag);
  });
});

describe('resolveTagNameFromLink', () => {
  function resolveFromSearchQuery(encodedQuery: string): string | null {
    return resolveTagNameFromLink(new URL(`/search?q=${encodedQuery}`, origin));
  }

  describe('Parsing from /search/?q=tag links', () => {
    it('should resolve a single tag from /search URLs', () => {
      expect(resolveFromSearchQuery('safe')).toBe('safe');
    });

    it('should return null for queries with multiple comma-separated tags', () => {
      // Comma acts as a separator in the query, resulting in multiple tokens
      expect(resolveFromSearchQuery('safe, suggestive')).toBe(null);
    });

    it('should return null if query is empty or not a term', () => {
      expect(resolveFromSearchQuery('')).toBe(null);
      expect(resolveFromSearchQuery('!')).toBe(null);
    });

    it('should properly treat parentheses in the query with single tag', () => {
      // Parentheses are operators in the query language, but when inside the tag name, they should still be properly
      // working.
      expect(resolveFromSearchQuery('experiment (casualties unknown)')).toBe('experiment (casualties unknown)');
    });

    it('should properly resolve queries with encoded characters', () => {
      expect(resolveFromSearchQuery('pok%C3%A9mon')).toBe('pokémon');
    });

    it('should unquote quoted term', () => {
      expect(resolveFromSearchQuery('"experiment (casualties unknown)"')).toBe('experiment (casualties unknown)')
      expect(resolveFromSearchQuery('"single tag, really"')).toBe('single tag, really');
    });
  })

  describe('Parsing from /tags/name links', () => {
    function resolveFromTagLink(encodedTagName: string): string | null {
      return resolveTagNameFromLink(new URL(`/tags/${encodedTagName}`, origin));
    }

    it('should resolve a single tag', () => {
      expect(resolveFromTagLink('safe')).toBe('safe');
    });

    it('should only read the tag page even if query is provided', () => {
      expect(resolveFromTagLink('grotesque?q=explicit')).toBe('grotesque');
    });

    it('should properly resolve links with encoded characters', () => {
      expect(resolveFromTagLink('pok%C3%A9mon')).toBe('pokémon');
    });

    it('should decoded slug-encoded characters', () => {
      // More common example where tag is.
      expect(resolveFromTagLink(`namespace-colon-tag+name`)).toBe('namespace:tag name');

      // Testing the whole list of encoded characters.
      for (const [encodedCharacter, decodedCharacter] of slugEncodedCharacters.entries()) {
        expect(resolveFromTagLink(`test+symbol${encodedCharacter}without+spaces`)).toBe(`test symbol${decodedCharacter}without spaces`);
        expect(resolveFromTagLink(`test+symbol+${encodedCharacter}+with+spaces`)).toBe(`test symbol ${decodedCharacter} with spaces`);
      }
    });
  });

  it('should return null for unsupported URLs', () => {
    expect(resolveTagNameFromLink(new URL('/pages/example', origin))).toBe(null);
  });
});

describe('resolveTagCategoryFromTagName', () => {
  it('should resolve any known namespace into its known category', () => {
    for (const [namespace, category] of namespaceCategories) {
      expect(resolveTagCategoryFromTagName(`${namespace}:${randomString()}`)).toBe(category);
    }
  });

  it('should ignore any namespace not listed in config', () => {
    expect(resolveTagCategoryFromTagName(`${randomString()}:${randomString()}`)).toBeNull();
  });
});
