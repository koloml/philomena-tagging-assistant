import { describe, expect, it } from 'vitest';
import { URL } from 'url';
import { resolveTagNameFromLink, slugEncodedCharacters } from '$lib/philomena/tag-utils';

describe('tag-utils', () => {
  const origin = 'https://furbooru.org';

  describe('resolveTagNameFromLink', () => {
    function resolveFromSearchQuery(encodedQuery: string): string | null {
      return resolveTagNameFromLink(new URL(`/search?q=${encodedQuery}`, origin));
    }

    describe('Parsing from /search/?q=tag links', () => {
      // Test cases for tags separated by commas
      it('should resolve a single tag from /search URLs', () => {
        expect(resolveFromSearchQuery('safe')).toBe('safe');
      });

      it('should return null for queries with multiple comma-separated tags', () => {
        // Comma acts as a separator in the query, resulting in multiple tokens
        expect(resolveFromSearchQuery('safe, suggestive')).toBe(null);
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
});
