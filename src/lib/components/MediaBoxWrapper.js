import {BaseComponent} from "$lib/components/base/BaseComponent.js";
import {getComponent} from "$lib/components/base/ComponentUtils.js";

export class MediaBoxWrapper extends BaseComponent {
  #thumbnailContainer = null;
  #imageLinkElement = null;

  /** @type {Map<string,string>|null} */
  #tagsAndAliases = null;

  init() {
    this.#thumbnailContainer = this.container.querySelector('.image-container.thumb');
    this.#imageLinkElement = this.#thumbnailContainer.querySelector('a');
  }

  #calculateMediaBoxTags() {
    /** @type {string[]|string[]} */
    const
      tagAliases = this.#thumbnailContainer.dataset.imageTagAliases?.split(', ') || [],
      actualTags = this.#imageLinkElement.title.split(' | Tagged: ')[1]?.split(', ') || [];

    /** @type {Map<string, string>} */
    const tagAliasesMap = new Map();

    for (let tagName of actualTags) {
      tagAliasesMap.set(tagName, tagName);
    }

    let currentRealTagName = null;

    for (let tagName of tagAliases) {
      if (tagAliasesMap.has(tagName)) {
        currentRealTagName = tagName;
        continue;
      }

      if (!currentRealTagName) {
        console.warn('No real tag found for the alias:', tagName);
        continue;
      }

      tagAliasesMap.set(tagName, currentRealTagName);
    }

    return tagAliasesMap;
  }

  get tagsAndAliases() {
    if (!this.#tagsAndAliases) {
      this.#tagsAndAliases = this.#calculateMediaBoxTags();
    }

    return this.#tagsAndAliases;
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
