import { BaseComponent } from "$lib/components/base/BaseComponent";
import { getComponent } from "$lib/components/base/component-utils";
import { MaintenancePopup } from "$lib/components/MaintenancePopup";
import { on } from "$lib/components/events/comms";
import { eventActiveProfileChanged } from "$lib/components/events/maintenance-popup-events";

export class MediaBoxTools extends BaseComponent {
  /** @type {import('./MediaBoxWrapper').MediaBoxWrapper|null} */
  #mediaBox;

  /** @type {MaintenancePopup|null} */
  #maintenancePopup = null;

  init() {
    const mediaBoxElement = this.container.closest('.media-box');

    if (!mediaBoxElement) {
      throw new Error('Toolbox element initialized outside of the media box!');
    }

    this.#mediaBox = getComponent(mediaBoxElement);

    for (let childElement of this.container.children) {
      const component = getComponent(childElement);

      if (!component) {
        continue;
      }

      if (!component.isInitialized) {
        component.initialize();
      }

      if (!this.#maintenancePopup && component instanceof MaintenancePopup) {
        this.#maintenancePopup = component;
      }
    }

    on(this, eventActiveProfileChanged, this.#onActiveProfileChanged.bind(this));
  }

  /**
   * @param {CustomEvent<import('$entities/MaintenanceProfile').default|null>} profileChangedEvent
   */
  #onActiveProfileChanged(profileChangedEvent) {
    this.container.classList.toggle('has-active-profile', profileChangedEvent.detail !== null);
  }

  /**
   * @return {MaintenancePopup|null}
   */
  get maintenancePopup() {
    return this.#maintenancePopup;
  }

  /**
   * @return {import('./MediaBoxWrapper').MediaBoxWrapper|null}
   */
  get mediaBox() {
    return this.#mediaBox;
  }
}

/**
 * Create a maintenance popup element.
 * @param {HTMLElement[]} childrenElements List of children elements to append to the component.
 * @return {HTMLElement} The maintenance popup element.
 */
export function createMediaBoxTools(...childrenElements) {
  const mediaBoxToolsContainer = document.createElement('div');
  mediaBoxToolsContainer.classList.add('media-box-tools');

  if (childrenElements.length) {
    mediaBoxToolsContainer.append(...childrenElements);
  }

  new MediaBoxTools(mediaBoxToolsContainer);

  return mediaBoxToolsContainer;
}
