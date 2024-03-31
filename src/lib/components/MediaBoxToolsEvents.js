import {BaseComponent} from "$lib/components/base/BaseComponent.js";
import {getComponent} from "$lib/components/base/ComponentUtils.js";
import {MaintenancePopup} from "$lib/components/MaintenancePopup.js";

export class MediaBoxTools extends BaseComponent {
  /** @type {MaintenancePopup|null} */
  #maintenancePopup = null;

  init() {
    for (let childElement of this.container.children) {
      const component = getComponent(childElement);

      if (!component) {
        continue;
      }

      if (!this.#maintenancePopup && component instanceof MaintenancePopup) {
        this.#maintenancePopup = component;
      }

      component.emit('tools-init', this);
    }

    this.on('active-profile-changed', this.#onActiveProfileChanged.bind(this));
  }

  /**
   * @param {MaintenanceProfile|null} activeProfile
   */
  #onActiveProfileChanged(activeProfile) {
    this.container.classList.toggle('has-active-profile', activeProfile !== null);
  }

  /**
   * @return {MaintenancePopup|null}
   */
  get maintenancePopup() {
    return this.#maintenancePopup;
  }
}

/**
 * Create a maintenance popup element.
 * @param {HTMLElement} childrenElements List of children elements to append to the component.
 * @return {HTMLElement} The maintenance popup element.
 */
export function createMediaBoxTools(...childrenElements) {
  const mediaBoxToolsContainer = document.createElement('div');
  mediaBoxToolsContainer.classList.add('media-box-tools');

  if (childrenElements.length) {
    mediaBoxToolsContainer.append(...childrenElements);
  }

  new MediaBoxTools(mediaBoxToolsContainer).initialize();

  return mediaBoxToolsContainer;
}
