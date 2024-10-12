import {BaseComponent} from "$lib/components/base/BaseComponent.js";

class TagsForm extends BaseComponent {
  /**
   * Button to edit tags for the image.
   * @type {HTMLElement|null}
   */
  #editTagButton;

  build() {
    this.#editTagButton = document.querySelector('#edit-tags');
  }

  init() {
    if (this.#editTagButton) {
      this.#editTagButton.addEventListener('click', this.#onEditClicked.bind(this));
    }
  }

  #onEditClicked() {
    this.#refreshTagColors();
  }

  /**
   * Collect all the tag categories available on the page and color the tags in the editor according to them.
   */
  #refreshTagColors() {
    const tagCategories = this.#gatherTagCategories();
    const editableTags = this.container.querySelectorAll('.tag');

    for (let tagElement of editableTags) {
      // Tag name is stored in the "remove" link and not in the tag itself.
      const removeLink = tagElement.querySelector('a');

      if (!removeLink) {
        continue;
      }

      const tagName = removeLink.dataset.tagName;

      if (!tagCategories.has(tagName)) {
        continue;
      }

      const categoryName = tagCategories.get(tagName);

      tagElement.dataset.tagCategory = categoryName;
      tagElement.setAttribute('data-tag-category', categoryName);
    }
  }

  /**
   * Collect list of categories from the tags on the page.
   * @return {Map<string, string>}
   */
  #gatherTagCategories() {
    /** @type {Map<string, string>} */
    const tagCategories = new Map();

    for (let tagElement of document.querySelectorAll('.tag[data-tag-name][data-tag-category]')) {
      tagCategories.set(tagElement.dataset.tagName, tagElement.dataset.tagCategory);
    }

    return tagCategories;
  }
}

export function initializeTagForm(container) {
  new TagsForm(container).initialize();
}
