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
    expect(parseQueryTypes('safe^1')).toEqual([TermToken, BoostToken]);
    expect(parseQueryTypes('safe, avali')).toEqual([TermToken, AndToken, TermToken]);
    expect(parseQueryTypes('!avali')).toEqual([NotToken, TermToken]);
    expect(parseQueryTypes('avali || 4 ears')).toEqual([TermToken, OrToken, TermToken]);
    expect(parseQueryTypes('avali && !4 ears')).toEqual([TermToken, AndToken, NotToken, TermToken]);

    expect(parseQueryTypes('avali AND (NOT 4 ears OR -3 fingers)')).toEqual([
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

  it('should properly differentiate between word-like operators and parts of tags', () => {
    expect(parseQueryTypes('safe AND sound')).toEqual([TermToken, AndToken, TermToken]);
    expect(parseQueryTypes('NOT safe AND dangerous')).toEqual([NotToken, TermToken, AndToken, TermToken]);
  });

  it('should only detect word-like operators when spaces are in place', () => {
    // Require whitespace between operator and other tokens
    expect(parseQueryTypes('NOT safeANDsound')).toEqual([NotToken, TermToken]);

    // If none are there, just should treat it as a part of a term
    expect(parseQuery('safeAND sound')[0].value).toEqual('safeAND sound');

    // All operators should be in all caps, otherwise it's just a term
    const [lowercaseOperatorWords] = parseQuery('avali are cute and you know it or else');
    expect(lowercaseOperatorWords.value).toBe('avali are cute and you know it or else');

    // And if it in caps, but part of some word, then it's just a word
    const [wordsInCapsContainingOperators] = parseQuery('THAT POOR KNOT IS PLAIN AS SAND');
    expect(wordsInCapsContainingOperators.value).toBe('THAT POOR KNOT IS PLAIN AS SAND');
  });

  it('should not treat any operators inside the quoted term as actual operators', () => {
    const tokens = parseQuery('"this AND that OR these NOT there || () && ^123"');
    const [quotedTermToken] = tokens;

    expect(tokens).toHaveLength(1);

    expect(quotedTermToken instanceof QuotedTermToken && quotedTermToken.decodedValue || null)
      .toBe('this AND that OR these NOT there || () && ^123');
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
