import { BaseComponent } from "$content/components/base/BaseComponent";
import { getComponent } from "$content/components/base/component-utils";
import { buildTagsAndAliasesMap } from "$lib/philomena/tag-utils";
import { on } from "$content/components/events/comms";
import { EVENT_TAGS_UPDATED } from "$content/components/events/tagging-profile-popup-events";
import type { MediaBoxTools } from "$content/components/extension/MediaBoxTools";

export class MediaBox extends BaseComponent {
  #thumbnailContainer: HTMLElement | null = null;
  #imageLinkElement: HTMLAnchorElement | null = null;
  #tagsAndAliases: Map<string, string> | null = null;
  #mediaBoxTools: MediaBoxTools | null = null;

  init() {
    this.#thumbnailContainer = this.container.querySelector('.image-container');
    this.#imageLinkElement = this.#thumbnailContainer?.querySelector('a') || null;

    on(this, EVENT_TAGS_UPDATED, this.#onTagsUpdatedRefreshTagsAndAliases.bind(this));
  }

  #onTagsUpdatedRefreshTagsAndAliases(tagsUpdatedEvent: CustomEvent<Map<string, string> | null>) {
    const updatedMap = tagsUpdatedEvent.detail;

    if (!(updatedMap instanceof Map)) {
      throw new TypeError("Tags and aliases should be stored as Map!");
    }

    this.#tagsAndAliases = updatedMap;
  }

  #calculateMediaBoxTags() {
    const tagAliases: string[] = this.#thumbnailContainer?.dataset.imageTagAliases?.split(', ') || [];
    const actualTags = this.#imageLinkElement?.title.split(' | Tagged: ')[1]?.split(', ') || [];

    return buildTagsAndAliasesMap(tagAliases, actualTags);
  }

  get uniqueTagsSet(): Set<string>|null {
    const tagsAndAliases = this.tagsAndAliases;

    if (tagsAndAliases === null) {
      return null;
    }

    return new Set(tagsAndAliases.values());
  }

  get tagsAndAliases(): Map<string, string> | null {
    if (!this.#tagsAndAliases) {
      this.#tagsAndAliases = this.#calculateMediaBoxTags();
    }

    return this.#tagsAndAliases;
  }

  get imageId(): number {
    const imageId = this.container.dataset.imageId;

    if (!imageId) {
      throw new Error('Missing image ID');
    }

    return parseInt(imageId);
  }

  get imageLinks(): App.ImageURIs {
    const jsonUris = this.#thumbnailContainer?.dataset.uris;

    if (!jsonUris) {
      throw new Error('Missing URIs!');
    }

    return JSON.parse(jsonUris);
  }

  get tools(): MediaBoxTools | null {
    return this.#mediaBoxTools;
  }

  /**
   * Wrap the media box element into the special wrapper.
   */
  static initialize(mediaBoxContainer: HTMLElement, mediaBoxToolsElement: HTMLElement) {
    const mediaBox = new MediaBox(mediaBoxContainer);
    mediaBox.initialize();

    mediaBoxContainer.appendChild(mediaBoxToolsElement);
    const mediaBoxToolsComponent = getComponent<MediaBoxTools>(mediaBoxToolsElement);
    mediaBoxToolsComponent?.initialize();

    mediaBox.#mediaBoxTools = mediaBoxToolsComponent;
  }

  static findElements(): NodeListOf<HTMLElement> {
    return document.querySelectorAll('.media-box');
  }

  static initializePositionCalculation(mediaBoxesList: NodeListOf<HTMLElement>) {
    window.addEventListener('resize', () => {
      let lastMediaBox: HTMLElement | null = null;
      let lastMediaBoxPosition: number | null = null;

      for (const mediaBoxElement of mediaBoxesList) {
        const yPosition = mediaBoxElement.getBoundingClientRect().y;
        const isOnTheSameLine = yPosition === lastMediaBoxPosition;

        mediaBoxElement.classList.toggle('media-box--first', !isOnTheSameLine);
        lastMediaBox?.classList.toggle('media-box--last', !isOnTheSameLine);

        lastMediaBox = mediaBoxElement;
        lastMediaBoxPosition = yPosition;
      }

      // Last-ever media box is checked separately
      if (lastMediaBox && !lastMediaBox.nextElementSibling) {
        lastMediaBox.classList.add('media-box--last');
      }
    })
  }
}
