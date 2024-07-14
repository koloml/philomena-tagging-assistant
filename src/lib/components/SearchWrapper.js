import {BaseComponent} from "$lib/components/base/BaseComponent.js";
import {QueryLexer, QuotedTermToken, TermToken, Token} from "$lib/booru/search/QueryLexer.js";

export class SearchWrapper extends BaseComponent {
  /** @type {HTMLInputElement|null} */
  #searchField = null;
  /** @type {string|null} */
  #lastParsedSearchValue = null;
  /** @type {Token[]} */
  #cachedParsedQuery = [];

  build() {
    this.#searchField = this.container.querySelector('input[name=q]');
  }

  init() {
    this.#searchField.addEventListener('input', this.#onInputFindProperties.bind(this));
  }

  /**
   * Catch the user input and execute suggestions logic.
   * @param {InputEvent} event Source event to find the input element from.
   */
  #onInputFindProperties(event) {
    const currentFragment = this.#findCurrentTagFragment();

    if (!currentFragment) {
      return;
    }

    this.#renderSuggestions(
      SearchWrapper.#resolveSuggestionsFromTerm(currentFragment),
      event.currentTarget
    );
  }

  /**
   * Get the selection position in the search field.
   * @return {number}
   */
  #getInputUserSelection() {
    return Math.min(
      this.#searchField.selectionStart,
      this.#searchField.selectionEnd
    );
  }

  /**
   * Parse the search query and return the list of parsed tokens. Result will be cached for current search query.
   * @return {Token[]}
   */
  #resolveQueryTokens() {
    const searchValue = this.#searchField.value;

    if (searchValue === this.#lastParsedSearchValue && this.#cachedParsedQuery) {
      return this.#cachedParsedQuery;
    }

    this.#lastParsedSearchValue = searchValue;
    this.#cachedParsedQuery = new QueryLexer(searchValue).parse();

    return this.#cachedParsedQuery;
  }

  /**
   * Find the currently selected term.
   * @return {string|null} Selected term or null if none found.
   */
  #findCurrentTagFragment() {
    if (!this.#searchField) {
      return null;
    }

    let searchValue = this.#searchField.value;

    if (!searchValue) {
      return null;
    }

    const token = SearchWrapper.#findActiveSearchTermPosition(
      this.#resolveQueryTokens(),
      this.#getInputUserSelection(),
    );

    if (token instanceof TermToken) {
      return token.value;
    }

    if (token instanceof QuotedTermToken) {
      return token.decodedValue;
    }

    return searchValue;
  }

  /**
   * Render the list of suggestions into the existing popup or create and populate a new one.
   * @param {string[]} suggestions List of suggestion to render the popup from.
   * @param {HTMLInputElement} targetInput Target input to attach the popup to.
   */
  #renderSuggestions(suggestions, targetInput) {
    /** @type {HTMLElement[]} */
    const suggestedListItems = suggestions
      .map(suggestedTerm => SearchWrapper.#renderTermSuggestion(suggestedTerm));

    requestAnimationFrame(() => {
      const autocompleteContainer = document.querySelector('.autocomplete') ?? SearchWrapper.#renderAutocompleteContainer();

      for (let existingTerm of autocompleteContainer.querySelectorAll('.autocomplete__item--property')) {
        existingTerm.remove();
      }

      const listContainer = autocompleteContainer.querySelector('ul');
      listContainer.prepend(...suggestedListItems);

      autocompleteContainer.style.position = 'absolute';
      autocompleteContainer.style.left = `${targetInput.offsetLeft}px`;
      autocompleteContainer.style.top = `${targetInput.offsetTop + targetInput.offsetHeight - targetInput.parentElement.scrollTop}px`;

      document.body.append(autocompleteContainer);
    })
  }

  /**
   * Loosely estimate where current selected search term is located and return it if found.
   * @param {Token[]} tokens Search value to find the actively selected term from.
   * @param {number} userSelectionIndex The index of the user selection.
   * @return {Token|null} Search term object or NULL if nothing found.
   */
  static #findActiveSearchTermPosition(tokens, userSelectionIndex) {
    return tokens.find(
      token => token.index < userSelectionIndex && token.index + token.value.length >= userSelectionIndex
    );
  }

  /**
   * Regular expression to search the properties' syntax.
   * @type {RegExp}
   */
  static #propertySearchTermHeadingRegExp = /^(?<name>[a-z\d_]+)(?<op_syntax>\.(?<op>[a-z]*))?(?<value_syntax>:(?<value>.*))?$/;

  /**
   * Create a list of suggested elements using the input received from the user.
   * @param {string} searchTermValue Original decoded term received from the user.
   * @return {string[]} List of suggestions. Could be empty.
   */
  static #resolveSuggestionsFromTerm(searchTermValue) {
    /** @type {string[]} */
    const suggestionsList = [];

    this.#propertySearchTermHeadingRegExp.lastIndex = 0;
    const parsedResult = this.#propertySearchTermHeadingRegExp.exec(searchTermValue);

    if (!parsedResult) {
      return suggestionsList;
    }

    const propertyName = parsedResult.groups.name;
    const hasOperatorSyntax = Boolean(parsedResult.groups.op_syntax);
    const hasValueSyntax = Boolean(parsedResult.groups.value_syntax);


    // No suggestions for values for now, maybe could add suggestions for namespaces like my:*
    if (hasValueSyntax) {
      return suggestionsList;
    }

    // If at least one dot placed, start suggesting operators
    if (hasOperatorSyntax) {
      const propertyType = this.#properties.get(propertyName);

      if (this.#typeOperators.has(propertyType)) {
        const operatorName = parsedResult.groups.op;

        for (let candidateOperator of this.#typeOperators.get(propertyType)) {
          if (operatorName && !candidateOperator.startsWith(operatorName)) {
            continue;
          }

          suggestionsList.push(`${propertyName}.${candidateOperator}:`);
        }
      }

      return suggestionsList;
    }

    // Otherwise, search for properties with names starting with the term
    for (let [candidateProperty] of this.#properties) {
      if (propertyName && !candidateProperty.startsWith(propertyName)) {
        continue;
      }

      suggestionsList.push(candidateProperty);
    }

    return suggestionsList;
  }

  /**
   * Render a new autocomplete container similar to the one generated by website. Might be sensitive to the updates
   * made to the Philomena.
   * @return {HTMLElement}
   */
  static #renderAutocompleteContainer() {
    const autocompleteContainer = document.createElement('div');
    autocompleteContainer.className = 'autocomplete';

    const innerListContainer = document.createElement('ul');
    innerListContainer.className = 'autocomplete__list';

    autocompleteContainer.append(innerListContainer);

    return autocompleteContainer;
  }

  /**
   * Render a single suggestion item and connect required events to interact with the user.
   * @param {string} suggestedTerm Term to use for suggestion item.
   * @return {HTMLElement} Resulting element.
   */
  static #renderTermSuggestion(suggestedTerm) {
    /** @type {HTMLElement} */
    const suggestionItem = document.createElement('li');
    suggestionItem.classList.add('autocomplete__item', 'autocomplete__item--property');
    suggestionItem.dataset.value = suggestedTerm;
    suggestionItem.innerText = suggestedTerm;

    suggestionItem.addEventListener('mouseover', () => {
      this.#findAndResetSelectedSuggestion(suggestionItem);
      suggestionItem.classList.add('autocomplete__item--selected');
    });

    suggestionItem.addEventListener('mouseout', () => {
      this.#findAndResetSelectedSuggestion(suggestionItem);
    })

    return suggestionItem;
  }

  /**
   * Find the selected suggestion item(s) and unselect them. Similar to the logic implemented by the Philomena's
   * front-end.
   * @param {HTMLElement} suggestedElement Target element to search from. If element is disconnected from the DOM,
   * search will be halted.
   */
  static #findAndResetSelectedSuggestion(suggestedElement) {
    if (!suggestedElement.parentElement) {
      return;
    }

    for (let selectedElement of suggestedElement.parentElement.querySelectorAll('.autocomplete__item--selected')) {
      selectedElement.classList.remove('autocomplete__item--selected');
    }
  }

  static #typeNumeric = Symbol();
  static #typeDate = Symbol();
  static #typeLiteral = Symbol();
  static #typePersonal = Symbol();

  static #properties = new Map([
    ['aspect_ratio', SearchWrapper.#typeNumeric],
    ['comment_count', SearchWrapper.#typeNumeric],
    ['created_at', SearchWrapper.#typeDate],
    ['description', SearchWrapper.#typeLiteral],
    ['downvotes', SearchWrapper.#typeNumeric],
    ['faved_by', SearchWrapper.#typeLiteral],
    ['faves', SearchWrapper.#typeNumeric],
    ['first_seen_at', SearchWrapper.#typeDate],
    ['height', SearchWrapper.#typeNumeric],
    ['id', SearchWrapper.#typeNumeric],
    ['orig_sha512_hash', SearchWrapper.#typeLiteral],
    ['score', SearchWrapper.#typeNumeric],
    ['sha512_hash', SearchWrapper.#typeLiteral],
    ['source_url', SearchWrapper.#typeLiteral],
    ['tag_count', SearchWrapper.#typeNumeric],
    ['uploader', SearchWrapper.#typeLiteral],
    ['upvotes', SearchWrapper.#typeNumeric],
    ['width', SearchWrapper.#typeNumeric],
    ['wilson_score', SearchWrapper.#typeNumeric],
    ['my', SearchWrapper.#typePersonal],
  ]);

  static #comparisonOperators = ['gt', 'gte', 'lt', 'lte'];

  static #typeOperators = new Map([
    [SearchWrapper.#typeNumeric, SearchWrapper.#comparisonOperators],
    [SearchWrapper.#typeDate, SearchWrapper.#comparisonOperators],
  ]);
}
