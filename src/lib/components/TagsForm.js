import { BaseComponent } from "$lib/components/base/BaseComponent";
import { getComponent } from "$lib/components/base/component-utils";

export class TagsForm extends BaseComponent {
  /**
   * Collect all the tag categories available on the page and color the tags in the editor according to them.
   */
  refreshTagColors() {
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

  static watchForEditors() {
    document.body.addEventListener('click', event => {
      const targetElement = event.target;

      if (!(targetElement instanceof HTMLElement)) {
        return;
      }

      const tagEditorWrapper = targetElement.closest('#image_tags_and_source');

      if (!tagEditorWrapper) {
        return;
      }

      const refreshTrigger = targetElement.closest('.js-taginput-show, #edit-tags')

      if (!refreshTrigger) {
        return;
      }

      const tagFormElement = tagEditorWrapper.querySelector('#tags-form');

      /** @type {TagsForm|null} */
      let tagEditor = getComponent(tagFormElement);

      if (!tagEditor || (!tagEditor instanceof TagsForm)) {
        tagEditor = new TagsForm(tagFormElement);
        tagEditor.initialize();
      }

      tagEditor.refreshTagColors();
    });
  }
}
