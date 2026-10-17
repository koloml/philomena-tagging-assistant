import PageParser from "$lib/philomena/scraping/parsing/PageParser";
import { buildTagsAndAliasesMap } from "$lib/philomena/tag-utils";

export default class PostParser extends PageParser {
  #tagEditorForm: HTMLFormElement | null = null;

  constructor(imageId: number) {
    super(`/images/${imageId}`);
  }

  async resolveTagEditorForm(): Promise<HTMLFormElement> {
    if (this.#tagEditorForm) {
      return this.#tagEditorForm;
    }

    const documentFragment = await this.resolveFragment();
    const tagsFormElement = documentFragment.querySelector<HTMLFormElement>("#tags-form");

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
   */
  async resolveTagsAndAliases(): Promise<Map<string, string> | null> {
    return PostParser.resolveTagsAndAliasesFromPost(
      await this.resolveFragment()
    );
  }

  /**
   * Resolve the list of tags and aliases from the post content.
   *
   * @param documentFragment Real content to parse the data from.
   *
   * @return Tags and aliases or null if failed to parse.
   */
  static resolveTagsAndAliasesFromPost(documentFragment: DocumentFragment): Map<string, string> | null {
    const imageShowContainer = documentFragment.querySelector<HTMLElement>('.image-show-container');
    const tagsForm = documentFragment.querySelector<HTMLFormElement>('#tags-form');

    if (!imageShowContainer || !tagsForm) {
      return null;
    }

    const tagsFormData = new FormData(tagsForm);
    const tagsAndAliasesValue = imageShowContainer.dataset.imageTagAliases;
    const tagsValue = tagsFormData.get(this.tagsInputName);

    if (!tagsAndAliasesValue || !tagsValue || typeof tagsValue !== 'string') {
      console.warn('Failed to locate tags & aliases!');
      return null;
    }

    const tagsAndAliasesList = tagsAndAliasesValue
      .split(',')
      .map(tagName => tagName.trim());

    const actualTagsList = tagsValue
      .split(',')
      .map(tagName => tagName.trim());

    return buildTagsAndAliasesMap(
      tagsAndAliasesList,
      actualTagsList,
    );
  }

  static readonly tagsInputName = 'image[tag_input]';
}
