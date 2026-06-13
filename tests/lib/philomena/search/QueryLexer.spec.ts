import {
  AndToken, GroupEndToken, GroupStartToken,
  NotToken,
  OrToken,
  QueryLexer,
  QuotedTermToken,
  TermToken,
  Token
} from "$lib/philomena/search/QueryLexer";

describe('QueryLexer', () => {
  function parseQuery(query: string): Token[] {
    return new QueryLexer(query).parse();
  }

  function parseQueryTypes(query: string): (typeof Token)[] {
    return parseQuery(query)
      .map(term => (term.constructor as any) as typeof Token);
  }

  it('should properly parse different kinds of queries', () => {
    expect(parseQueryTypes('safe')).toEqual([TermToken]);
    expect(parseQueryTypes('safe, avali')).toEqual([TermToken, AndToken, TermToken]);
    expect(parseQueryTypes('!avali')).toEqual([NotToken, TermToken]);
    expect(parseQueryTypes('avali || 4 ears')).toEqual([TermToken, OrToken, TermToken]);
    expect(parseQueryTypes('avali && !4 ears')).toEqual([TermToken, AndToken, NotToken, TermToken]);

    expect(parseQueryTypes('avali AND (!4 ears OR -3 fingers)')).toEqual([
      TermToken, AndToken, GroupStartToken, NotToken, TermToken, OrToken, NotToken, TermToken, GroupEndToken,
    ]);
  });

  it('should not treat parentheses as groups inside the term', () => {
    expect(parseQueryTypes('!(experiment (casualties unknown) || milky (casualties unknown))')).toEqual([
      NotToken, GroupStartToken, TermToken, OrToken, TermToken, GroupEndToken,
    ]);
  });

  it('should accept any amount of whitespaces between different tokens', () => {
    expect(parseQueryTypes('!     ( avali     ,  experiment (casualties unknown)   )  &&  safe')).toEqual([
      NotToken, GroupStartToken, TermToken, AndToken, TermToken, GroupEndToken, AndToken, TermToken,
    ]);
  });

  it('should trim whitespaces inside the terms, even in quoted ones', () => {
    const [termWithSpaces] = parseQuery('  avali  ');
    expect(termWithSpaces.value).toBe('avali');

    const [quotedTermWithSpaces] = parseQuery('   "  avali  "   ');
    expect(quotedTermWithSpaces instanceof QuotedTermToken && quotedTermWithSpaces.decodedValue || new Error('Wrong token')).toBe('avali');
  });

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
