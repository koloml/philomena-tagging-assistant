import { BaseComponent } from "$content/components/base/BaseComponent";
import { getComponent } from "$content/components/base/component-utils";
import { TaggingProfilePopup } from "$content/components/extension/profiles/TaggingProfilePopup";
import { on } from "$content/components/events/comms";
import { EVENT_ACTIVE_PROFILE_CHANGED } from "$content/components/events/tagging-profile-popup-events";
import type { MediaBox } from "$content/components/philomena/MediaBox";
import type TaggingProfile from "$entities/TaggingProfile";

export class MediaBoxTools extends BaseComponent {
  #mediaBox: MediaBox | null = null;
  #popup: TaggingProfilePopup | null = null;

  init() {
    const mediaBoxElement = this.container.closest<HTMLElement>('.media-box');

    if (!mediaBoxElement) {
      throw new Error('Toolbox element initialized outside of the media box!');
    }

    this.#mediaBox = getComponent(mediaBoxElement);

    for (let childElement of this.container.children) {
      if (!(childElement instanceof HTMLElement)) {
        continue;
      }

      const component = getComponent(childElement);

      if (!component) {
        continue;
      }

      if (!component.isInitialized) {
        component.initialize();
      }

      if (!this.#popup && component instanceof TaggingProfilePopup) {
        this.#popup = component;
      }
    }

    on(this, EVENT_ACTIVE_PROFILE_CHANGED, this.#onActiveProfileChanged.bind(this));
  }

  #onActiveProfileChanged(profileChangedEvent: CustomEvent<TaggingProfile | null>) {
    this.container.classList.toggle('has-active-profile', profileChangedEvent.detail !== null);
  }

  get mediaBox(): MediaBox | null {
    return this.#mediaBox;
  }

  /**
   * Create a maintenance popup element.
   * @param childrenElements List of children elements to append to the component.
   * @return The maintenance popup element.
   */
  static create(...childrenElements: HTMLElement[]): HTMLElement {
    const mediaBoxToolsContainer = document.createElement('div');
    mediaBoxToolsContainer.classList.add('media-box-tools');

    if (childrenElements.length) {
      mediaBoxToolsContainer.append(...childrenElements);
    }

    new MediaBoxTools(mediaBoxToolsContainer);

    return mediaBoxToolsContainer;
  }
}
