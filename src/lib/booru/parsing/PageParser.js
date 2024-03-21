export default class PageParser {
  /** @type {string} */
  #url;
  /** @type {DocumentFragment|null} */
  #fragment;

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

    const documentFragment = document.createDocumentFragment();
    const template = document.createElement('template');
    template.innerHTML = await response.text();

    documentFragment.append(...template.content.childNodes);

    this.#fragment = documentFragment;

    return documentFragment;
  }

  clear() {
    this.#fragment = null;
  }
}

