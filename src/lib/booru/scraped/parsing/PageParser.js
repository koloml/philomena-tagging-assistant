export default class PageParser {
  /** @type {string} */
  #url;
  /** @type {DocumentFragment|null} */
  #fragment = null;

  constructor(url) {
    this.#url = url;
  }

  /**
   * @return {Promise<DocumentFragment>}
   */
  async resolveFragment() {
    if (this.#fragment) {
      return this.#fragment;
    }

    const response = await fetch(this.#url);

    if (!response.ok) {
      throw new Error(`Failed to load page from ${this.#url}`);
    }

    this.#fragment = await PageParser.resolveFragmentFromResponse(response);

    return this.#fragment;
  }

  clear() {
    this.#fragment = null;
  }

  /**
   * Create a document fragment from the following response.
   *
   * @param {Response} response Response to create a fragment from. Note, that this response will be used. If you need
   * to use the same response somewhere else, then you need to pass a cloned version of the response.
   *
   * @return {Promise<DocumentFragment>} Resulting document fragment ready for processing.
   */
  static async resolveFragmentFromResponse(response) {
    const documentFragment = document.createDocumentFragment();
    const template = document.createElement('template');
    template.innerHTML = await response.text();

    documentFragment.append(...template.content.childNodes);

    return documentFragment;
  }
}

