import {BaseComponent} from "$lib/components/base/BaseComponent.js";
import {getComponent} from "$lib/components/base/ComponentUtils.js";
import {buildTagsAndAliasesMap} from "$lib/booru/TagsUtils.js";

export class MediaBoxWrapper extends BaseComponent {
  #thumbnailContainer = null;
  #imageLinkElement = null;

  /** @type {Map<string,string>|null} */
  #tagsAndAliases = null;

  init() {
    this.#thumbnailContainer = this.container.querySelector('.image-container');
    this.#imageLinkElement = this.#thumbnailContainer.querySelector('a');

    this.on('tags-updated', this.#onTagsUpdatedRefreshTagsAndAliases.bind(this));
  }

  /**
   * @param {CustomEvent<Map<string,string>>} tagsUpdatedEvent
   */
  #onTagsUpdatedRefreshTagsAndAliases(tagsUpdatedEvent) {
    const updatedMap = tagsUpdatedEvent.detail;

    if (!(updatedMap instanceof Map)) {
      throw new TypeError("Tags and aliases should be stored as Map!");
    }

    this.#tagsAndAliases = updatedMap;
  }

  #calculateMediaBoxTags() {
    /** @type {string[]|string[]} */
    const
      tagAliases = this.#thumbnailContainer.dataset.imageTagAliases?.split(', ') || [],
      actualTags = this.#imageLinkElement.title.split(' | Tagged: ')[1]?.split(', ') || [];

    return buildTagsAndAliasesMap(tagAliases, actualTags);
  }

  /**
   * @return {Map<string, string>|null}
   */
  get tagsAndAliases() {
    if (!this.#tagsAndAliases) {
      this.#tagsAndAliases = this.#calculateMediaBoxTags();
    }

    return this.#tagsAndAliases;
  }

  get imageId() {
    return parseInt(
      this.container.dataset.imageId
    );
  }
}

/**
 * Wrap the media box element into the special wrapper.
 * @param {HTMLElement} mediaBoxContainer
 * @param {HTMLElement[]} childComponentElements
 */
export function initializeMediaBox(mediaBoxContainer, childComponentElements) {
  new MediaBoxWrapper(mediaBoxContainer)
    .initialize();

  for (let childComponentElement of childComponentElements) {
    mediaBoxContainer.appendChild(childComponentElement);
    getComponent(childComponentElement)?.initialize();
  }
}
