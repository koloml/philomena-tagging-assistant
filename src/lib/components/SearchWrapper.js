import {BaseComponent} from "$lib/components/base/BaseComponent.js";
import {QueryLexer, QuotedTermToken, TermToken, Token} from "$lib/booru/search/QueryLexer.js";

export class SearchWrapper extends BaseComponent {
  /** @type {HTMLInputElement|null} */
  #searchField = null;
  /** @type {HTMLInputElement|null} */
  #autoCompleteField = null;
  /** @type {string|null} */
  #lastParsedSearchValue = null;
  /** @type {Token[]} */
  #cachedParsedQuery = [];

  build() {
    this.container.classList.add('header__search--completable');

    this.#searchField = this.container.querySelector('input[name=q]');
    this.#searchField.autocomplete = 'off'; // Browser's auto-complete will get in the way!

    const autoCompleteField = document.createElement('input');
    autoCompleteField.dataset.ac = 'true';
    autoCompleteField.dataset.acMinLength = '3';
    autoCompleteField.dataset.acSource = '/autocomplete/tags?term=';
    autoCompleteField.classList.add('search-autocomplete-dummy');

    this.#autoCompleteField = autoCompleteField;

    this.container.appendChild(autoCompleteField);
  }

  init() {
    this.#searchField.addEventListener('input', this.#updateAutoCompletedFragment.bind(this));
    this.#searchField.addEventListener('keydown', this.#onSearchFieldKeyPressed.bind(this));
    this.#searchField.addEventListener('selectionchange', this.#updateAutoCompletedFragment.bind(this));
  }

  #updateAutoCompletedFragment() {
    const searchableFragment = this.#findCurrentTagFragment();
    this.#emitAutoComplete(searchableFragment || '');
  }

  #getInputUserSelection() {
    return Math.min(
      this.#searchField.selectionStart,
      this.#searchField.selectionEnd
    );
  }

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
   * @param {KeyboardEvent} event
   */
  #onSearchFieldKeyPressed(event) {
    // On enter, attempt to replace the current active tag in the query with autocomplete selection
    if (event.code === 'Enter') {
      this.#onEnterPressed(event);
    }

    this.#autoCompleteField.dispatchEvent(
      new KeyboardEvent('keydown', {
        keyCode: event.keyCode
      })
    );

    // Similarly to the site's autocomplete logic, we need to prevent the arrows up/down from causing any issues
    if (event.keyCode === 38 || event.keyCode === 40) {
      event.preventDefault();
    }
  }

  /**
   * @param {KeyboardEvent} event
   */
  #onEnterPressed(event) {
    const autocompleteSelection = document.querySelector('.autocomplete__item--selected');

    if (!autocompleteSelection) {
      return;
    }

    const activeToken = SearchWrapper.#findActiveSearchTermPosition(
      this.#resolveQueryTokens(),
      this.#getInputUserSelection(),
    );

    if (activeToken instanceof TermToken || activeToken instanceof QuotedTermToken) {
      const selectionStart = activeToken.index;
      const selectionEnd = activeToken.index + activeToken.value.length;

      let autocompletedValue = autocompleteSelection.dataset.value;

      if (activeToken instanceof QuotedTermToken) {
        autocompletedValue = `"${QuotedTermToken.encode(autocompletedValue)}"`;
      }

      this.#searchField.value = this.#searchField.value.slice(0, selectionStart)
        + autocompletedValue
        + this.#searchField.value.slice(selectionEnd);

      const newSelectionEnd = selectionStart + autocompletedValue.length;

      // Place the caret at the end of the currently active tag.
      // Actually, this does not work for some reason. After the tag is sent to the field and selection was changed to
      // the end of the inserted tag, browser just does not scroll the input to the caret position.
      this.#searchField.focus();
      this.#searchField.setSelectionRange(newSelectionEnd, newSelectionEnd);

      event.preventDefault();
    }
  }

  /**
   * @return {string|null}
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

  #emitAutoComplete(userInputFragment) {
    this.#autoCompleteField.value = userInputFragment;

    // Should be at least one frame away, since input event always removes autocomplete window
    requestAnimationFrame(() => {
      this.#autoCompleteField.dispatchEvent(
        new InputEvent('input', {bubbles: true})
      );

      const autocompleteContainer = document.querySelector('.autocomplete');

      if (autocompleteContainer) {
        autocompleteContainer.style.left = `${this.container.offsetLeft}px`;
      }
    });
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
}

export function initializeSearWrapper(formElement) {
  new SearchWrapper(formElement).initialize();
}
