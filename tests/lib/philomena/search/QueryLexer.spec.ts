import { QueryLexer, QuotedTermToken, Token } from "$lib/philomena/search/QueryLexer";

describe('QueryLexer', () => {
  function parseQuery(query: string): Token[] {
    return new QueryLexer(query).parse();
  }

  describe('QuotedTermToken', () => {
    it('should decode and encode quotes and backslash', () => {
      const encodedQuote = `"term with \\\" inside of it"`;
      const decodedQuote = 'term with " inside of it';

      expect(QuotedTermToken.decode(encodedQuote)).toBe(decodedQuote);
      expect(QuotedTermToken.encode(decodedQuote)).toBe(encodedQuote);

      const encodedBackslash = `"term with \\\\ inside of it"`;
      const decodedBackslash = 'term with \\ inside of it';

      expect(QuotedTermToken.decode(encodedBackslash)).toBe(decodedBackslash);
      expect(QuotedTermToken.encode(decodedBackslash)).toBe(encodedBackslash);
    });

    it('should not care for anything else', () => {
      const encodedTerm = '"operators: , && || AND OR NOT ! ^ ? *"';
      const decodedTerm = 'operators: , && || AND OR NOT ! ^ ? *';

      expect(QuotedTermToken.decode(encodedTerm)).toBe(decodedTerm);
      expect(QuotedTermToken.encode(decodedTerm)).toBe(encodedTerm);
    });
  });
});
