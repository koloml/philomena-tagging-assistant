import { BaseComponent } from "$content/components/base/BaseComponent";
import { getComponent } from "$content/components/base/component-utils";
import { on } from "$content/components/events/comms";
import {
  EVENT_PROFILE_POPUP_STATE_CHANGED,
  type ProfilePopupState
} from "$content/components/events/tagging-profile-popup-events";
import type { MediaBoxTools } from "$content/components/extension/MediaBoxTools";

export class TaggingProfileStatusIcon extends BaseComponent {
  #mediaBoxTools: MediaBoxTools | null = null;

  build() {
    this.container.innerText = '🔧';
  }

  init() {
    if (!this.container.parentElement) {
      throw new Error('Missing parent element for the maintenance status icon!');
    }

    this.#mediaBoxTools = getComponent(this.container.parentElement);

    if (!this.#mediaBoxTools) {
      throw new Error('Status icon element initialized outside of the media box!');
    }

    on(this.#mediaBoxTools, EVENT_PROFILE_POPUP_STATE_CHANGED, this.#onPopupStateChanged.bind(this));
  }

  #onPopupStateChanged(stateChangeEvent: CustomEvent<ProfilePopupState>) {
    // TODO Replace those with FontAwesome icons later. Those icons can probably be sourced from the website itself.
    switch (stateChangeEvent.detail) {
      case "ready":
        this.container.innerText = '🔧';
        break;

      case "waiting":
        this.container.innerText = '⏳';
        break;

      case "processing":
        this.container.innerText = '📤';
        break;

      case "complete":
        this.container.innerText = '✅';
        break;

      case "failed":
        this.container.innerText = '⚠️';
        break;

      default:
        this.container.innerText = '❓';
    }
  }

  static create(): HTMLElement {
    const element = document.createElement('div');
    element.classList.add('maintenance-status-icon');

    new TaggingProfileStatusIcon(element);

    return element;
  }
}
