import PageParser from "$lib/booru/scraped/parsing/PageParser";
import { buildTagsAndAliasesMap } from "$lib/booru/tag-utils";

export default class PostParser extends PageParser {
  /** @type {HTMLFormElement} */
  #tagEditorForm;

  constructor(imageId) {
    super(`/images/${imageId}`);
  }

  /**
   * @return {Promise<HTMLFormElement>}
   */
  async resolveTagEditorForm() {
    if (this.#tagEditorForm) {
      return this.#tagEditorForm;
    }

    const documentFragment = await this.resolveFragment();
    const tagsFormElement = documentFragment.querySelector("#tags-form");

    if (!tagsFormElement) {
      throw new Error("Failed to find the tag editor form");
    }

    this.#tagEditorForm = tagsFormElement;

    return tagsFormElement;
  }

  async resolveTagEditorFormData() {
    return new FormData(
      await this.resolveTagEditorForm()
    );
  }

  /**
   * Resolve the tags and aliases mapping from the post page.
   *
   * @return {Promise<Map<string, string>|null>}
   */
  async resolveTagsAndAliases() {
    return PostParser.resolveTagsAndAliasesFromPost(
      await this.resolveFragment()
    );
  }

  /**
   * Resolve the list of tags and aliases from the post content.
   *
   * @param {DocumentFragment} documentFragment Real content to parse the data from.
   *
   * @return {Map<string, string>|null} Tags and aliases or null if failed to parse.
   */
  static resolveTagsAndAliasesFromPost(documentFragment) {
    const imageShowContainer = documentFragment.querySelector('.image-show-container');
    const tagsForm = documentFragment.querySelector('#tags-form');

    if (!imageShowContainer || !tagsForm) {
      return null;
    }

    const tagsFormData = new FormData(tagsForm);

    const tagsAndAliasesList = imageShowContainer.dataset.imageTagAliases
      .split(',')
      .map(tagName => tagName.trim());

    const actualTagsList = tagsFormData.get(this.tagsInputName)
      .split(',')
      .map(tagName => tagName.trim());

    return buildTagsAndAliasesMap(
      tagsAndAliasesList,
      actualTagsList,
    );
  }

  static tagsInputName = 'image[tag_input]';
}
