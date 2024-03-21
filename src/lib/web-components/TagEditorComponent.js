export default class TagEditorComponent extends HTMLElement {
  /**
   * Array of elements representing tags.
   * @type {HTMLElement[]}
   */
  #tagElements = [];

  /**
   * Generated input for adding new tags to the tag list. Will be rendered on connecting.
   * @type {HTMLInputElement|undefined}
   */
  #tagInput;

  /**
   * Cached list of tag names. Changing this value will not automatically change the actual tags.
   * @type {Set<string>}
   */
  #tagsSet = new Set();

  constructor() {
    super();
  }

  connectedCallback() {
    if (!this.#tagInput) {
      this.#tagInput = document.createElement('input');
      this.appendChild(this.#tagInput);
      this.#tagInput.addEventListener('keydown', this.#onKeyDownDetectActions.bind(this));
    }

    if (!this.#tagElements.length) {
      this.#renderTags();
    }

    this.addEventListener('click', this.#onClickDetectTagRemoval.bind(this));
  }

  /**
   * Render the list of tag elements based on the tag attribute. Should be called every time tag attribute is changed.
   */
  #renderTags() {
    const tags = this.getAttribute(TagEditorComponent.#tagsAttribute) || '';

    const updatedTagsSet = new Set(
      tags.split(',')
        .map(tagName => tagName.trim())
        .filter(Boolean)
    );

    this.#tagsSet = new Set(updatedTagsSet.values());

    this.#tagElements = this.#tagElements.filter(tagElement => {
      const tagName = tagElement.dataset.tag;

      if (!updatedTagsSet.has(tagName)) {
        tagElement.remove();
        return false;
      }

      updatedTagsSet.delete(tagName);
      return true;
    });

    for (let tagName of updatedTagsSet) {
      const tagElement = document.createElement('div');
      tagElement.classList.add('tag');
      tagElement.innerText = tagName;
      tagElement.dataset.tag = tagName;

      const tagRemoveElement = document.createElement("span");
      tagRemoveElement.classList.add('remove');
      tagRemoveElement.innerText = 'x';

      tagElement.appendChild(tagRemoveElement);

      this.#tagInput.insertAdjacentElement('beforebegin', tagElement);
      this.#tagElements.push(tagElement);
    }
  }

  /**
   * Detect add/remove keyboard shortcuts on the input.
   * @param {KeyboardEvent} event
   */
  #onKeyDownDetectActions(event) {
    const isTagSubmit = event.key === 'Enter';
    const isTagRemove = event.key === 'Backspace' && !this.#tagInput.value.length;

    if (!isTagSubmit && !isTagRemove) {
      return;
    }

    if (isTagSubmit) {
      event.preventDefault();
    }

    const providedTagName = this.#tagInput.value.trim();

    if (providedTagName && isTagSubmit) {
      if (!this.#tagsSet.has(providedTagName)) {
        this.setAttribute(
          TagEditorComponent.#tagsAttribute,
          [...this.#tagsSet, providedTagName].join(',')
        );
      }

      this.#tagInput.value = '';
      return;
    }

    if (isTagRemove && this.#tagsSet.size) {
      this.setAttribute(
        TagEditorComponent.#tagsAttribute,
        [...this.#tagsSet].slice(0, -1).join(',')
      )
    }
  }

  /**
   * Detect clicks on the "remove" button inside tags.
   * @param {MouseEvent} event
   */
  #onClickDetectTagRemoval(event) {
    /** @type {HTMLElement} */
    const maybeRemoveTagElement = event.target;

    if (!maybeRemoveTagElement.classList.contains('remove')) {
      return;
    }

    /** @type {HTMLElement} */
    const tagElement = maybeRemoveTagElement.closest('.tag');

    if (!tagElement) {
      return;
    }

    const tagName = tagElement.dataset.tag;

    if (this.#tagsSet.has(tagName)) {
      this.#tagsSet.delete(tagName);
      this.setAttribute(
        TagEditorComponent.#tagsAttribute,
        [...this.#tagsSet].join(",")
      );
    }
  }

  /**
   * @param {string} name
   * @param {string} from
   * @param {string} to
   */
  attributeChangedCallback(name, from, to) {
    if (!this.isConnected) {
      return;
    }

    if (name === TagEditorComponent.#tagsAttribute) {
      this.#renderTags();

      this.dispatchEvent(
        new CustomEvent(
          'change',
          {
            detail: [...this.#tagsSet.values()]
          }
        )
      );
    }
  }

  static get observedAttributes() {
    return [this.#tagsAttribute];
  }

  static #tagsAttribute = 'tags';
}

if (!customElements.get('tags-editor')) {
  customElements.define('tags-editor', TagEditorComponent);
} else {
  console.warn('Tags Component is attempting to initialize twice!');
}