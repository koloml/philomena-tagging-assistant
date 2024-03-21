import PageParser from "$lib/booru/parsing/PageParser.js";

export default class ImagePageParser extends PageParser {
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
}