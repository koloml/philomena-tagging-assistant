import { BaseComponent } from "$lib/components/base/BaseComponent";
import { getComponent } from "$lib/components/base/component-utils";
import { buildTagsAndAliasesMap } from "$lib/booru/tag-utils";
import { on } from "$lib/components/events/comms";
import { eventTagsUpdated } from "$lib/components/events/maintenance-popup-events";

export class MediaBoxWrapper extends BaseComponent {
  #thumbnailContainer = null;
  #imageLinkElement = null;

  /** @type {Map<string,string>|null} */
  #tagsAndAliases = null;

  init() {
    this.#thumbnailContainer = this.container.querySelector('.image-container');
    this.#imageLinkElement = this.#thumbnailContainer.querySelector('a');

    on(this, eventTagsUpdated, this.#onTagsUpdatedRefreshTagsAndAliases.bind(this));
  }

  /**
   * @param {CustomEvent<Map<string,string>|null>} tagsUpdatedEvent
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

  /**
   * @return {App.ImageURIs}
   */
  get imageLinks() {
    return JSON.parse(this.#thumbnailContainer.dataset.uris);
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

/**
 * @param {NodeListOf<HTMLElement>} mediaBoxesList
 */
export function calculateMediaBoxesPositions(mediaBoxesList) {
  window.addEventListener('resize', () => {
    /** @type {HTMLElement|null} */
    let lastMediaBox = null,
      /** @type {number|null} */
      lastMediaBoxPosition = null;

    for (let mediaBoxElement of mediaBoxesList) {
      const yPosition = mediaBoxElement.getBoundingClientRect().y;
      const isOnTheSameLine = yPosition === lastMediaBoxPosition;

      mediaBoxElement.classList.toggle('media-box--first', !isOnTheSameLine);
      lastMediaBox?.classList.toggle('media-box--last', !isOnTheSameLine);

      lastMediaBox = mediaBoxElement;
      lastMediaBoxPosition = yPosition;
    }
  })
}
