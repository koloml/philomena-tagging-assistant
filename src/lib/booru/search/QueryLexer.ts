export class Token {
  readonly index: number;
  readonly value: string;

  constructor(index: number, value: string) {
    this.index = index;
    this.value = value;
  }
}


export class AndToken extends Token {
}

export class NotToken extends Token {
}

export class OrToken extends Token {
}

export class GroupStartToken extends Token {
}

export class GroupEndToken extends Token {
}

export class BoostToken extends Token {
}

export class QuotedTermToken extends Token {
  readonly #quotedValue: string;

  constructor(index: number, value: string, quotedValue: string) {
    super(index, value);

    this.#quotedValue = quotedValue;
  }

  get decodedValue() {
    return QuotedTermToken.decode(this.#quotedValue);
  }

  static decode(value: string): string {
    return value.replace(/\\([\\"])/g, "$1");
  }

  static encode(value: string): string {
    return value.replace(/[\\"]/g, "\\$&");
  }
}

export class TermToken extends Token {
}

type MatchResultCarry = {
  match?: RegExpMatchArray | null
}

/**
 * Search query tokenizer. Should mostly work for the cases of parsing and finding the selected term for
 * auto-completion. Follows the rules described in the Philomena booru engine.
 */
export class QueryLexer {
  /**
   * The original value to be parsed.
   */
  readonly #value: string;

  /**
   * Current position of the parser in the value.
   */
  #index: number = 0;

  constructor(value: string) {
    this.#value = value;
  }

  /**
   * Parse the query and get the list of tokens.
   *
   * @return List of tokens.
   */
  parse(): Token[] {
    const tokens: Token[] = [];
    const result: MatchResultCarry = {};

    let dirtyText: string;

    while (this.#index < this.#value.length) {
      if (this.#value[this.#index] === QueryLexer.#commaCharacter) {
        tokens.push(new AndToken(this.#index, this.#value[this.#index]));
        this.#index++;
        continue;
      }

      if (this.#match(QueryLexer.#negotiationOperator, result)) {
        tokens.push(new NotToken(this.#index, result.match![0]));
        this.#index += result.match![0].length;
        continue;
      }

      if (this.#match(QueryLexer.#andOperator, result)) {
        tokens.push(new AndToken(this.#index, result.match![0]));
        this.#index += result.match![0].length;
        continue;
      }

      if (this.#match(QueryLexer.#orOperator, result)) {
        tokens.push(new OrToken(this.#index, result.match![0]));
        this.#index += result.match![0].length;
        continue;
      }

      if (this.#match(QueryLexer.#notOperator, result)) {
        tokens.push(new NotToken(this.#index, result.match![0]));
        this.#index += result.match![0].length;
        continue;
      }

      if (this.#value[this.#index] === QueryLexer.#bracketsOpenCharacter) {
        tokens.push(new GroupStartToken(this.#index, this.#value[this.#index]));
        this.#index++;
        continue;
      }

      if (this.#value[this.#index] === QueryLexer.#bracketsCloseCharacter) {
        tokens.push(new GroupEndToken(this.#index, this.#value[this.#index]));
        this.#index++;
        continue;
      }

      if (this.#match(QueryLexer.#boostOperator, result)) {
        tokens.push(new BoostToken(this.#index, result.match![0]));
        this.#index += result.match![0].length;
        continue;
      }

      if (this.#match(QueryLexer.#whitespaces, result)) {
        this.#index += result.match![0].length;
        continue;
      }

      if (this.#match(QueryLexer.#quotedText, result)) {
        tokens.push(new QuotedTermToken(this.#index, result.match![0], result.match![1]));
        this.#index += result.match![0].length;
        continue;
      }

      dirtyText = this.#parseDirtyText(this.#index);

      if (dirtyText) {
        tokens.push(new TermToken(this.#index, dirtyText));
        this.#index += dirtyText.length;
        continue;
      }

      break;
    }

    return tokens;
  }

  /**
   * Match the provided regular expression on the string with the current parser position.
   *
   * @param targetRegExp Target RegExp to parse with.
   * @param [resultCarrier] Object for passing the results into.
   *
   * @return Is there a match?
   */
  #match(targetRegExp: RegExp, resultCarrier: MatchResultCarry = {}): boolean {
    return this.#matchAt(targetRegExp, this.#index, resultCarrier);
  }

  /**
   * Match the provided regular expression in the string with the specific index.
   *
   * @param targetRegExp Target RegExp to parse with.
   * @param index Index to match the expression from.
   * @param [resultCarrier] Object for passing the results into.
   *
   * @return Is there a match?
   */
  #matchAt(targetRegExp: RegExp, index: number, resultCarrier: MatchResultCarry = {}): boolean {
    targetRegExp.lastIndex = index;
    resultCarrier.match = this.#value.match(targetRegExp);

    return resultCarrier.match !== null;
  }

  /**
   * Parse the dirty text.
   *
   * @param {number} index Index to start the parsing from.
   *
   * @return {string} Matched text.
   */
  #parseDirtyText(index: number): string {
    let resultValue: string = '';

    const result: MatchResultCarry = {match: null};

    // Loop over
    while (index < this.#value.length) {
      // If the stop word found then return the value.
      if (this.#matchAt(QueryLexer.#dirtyTextStopWords, index)) {
        break;
      }

      if (this.#matchAt(QueryLexer.#dirtyTextContent, index, result)) {
        resultValue += result.match![0];
        index += result.match![0].length;
        continue;
      }

      if (this.#value[index] === QueryLexer.#bracketsOpenCharacter) {
        let bracketsContent = QueryLexer.#bracketsOpenCharacter + this.#parseDirtyText(index + 1);

        if (this.#value[index + bracketsContent.length + 1] === QueryLexer.#bracketsCloseCharacter) {
          bracketsContent += QueryLexer.#bracketsCloseCharacter;
        }

        // There could be an error about brackets not being open

        resultValue += bracketsContent;
        index += bracketsContent.length;
        continue;
      }

      break;
    }

    return resultValue;
  }

  static #commaCharacter = ',';
  static #negotiationOperator = /[!-]/y;
  static #andOperator = /\s+(?:AND|&&)\s+/y;
  static #orOperator = /\s+(?:OR|\|\|)\s+/y;
  static #notOperator = /NOT\s+/y;
  static #bracketsOpenCharacter = "(";
  static #bracketsCloseCharacter = ")";
  static #boostOperator = /\^[+-]?\d+(?:\.\d+)?/y;
  static #whitespaces = /\s+/y;
  static #quotedText = /"((?:\\.|[^\\"])+)"/y;
  static #dirtyTextStopWords = /,|\s+(?:AND|&&|OR|\|\|)\s+|\s+(?:\)|\^[+-]?\d+(?:\.\d+)?)/y;
  static #dirtyTextContent = /\\.|[^()]/y;
}
