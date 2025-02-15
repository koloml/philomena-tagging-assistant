import { BaseComponent } from "$lib/components/base/BaseComponent";
import { getComponent } from "$lib/components/base/component-utils";
import { on } from "$lib/components/events/comms";
import { eventMaintenanceStateChanged } from "$lib/components/events/maintenance-popup-events";

export class MaintenanceStatusIcon extends BaseComponent {
  /** @type {import('./MediaBoxTools').MediaBoxTools} */
  #mediaBoxTools;

  build() {
    this.container.innerText = '🔧';
  }

  init() {
    this.#mediaBoxTools = getComponent(this.container.parentElement);

    if (!this.#mediaBoxTools) {
      throw new Error('Status icon element initialized outside of the media box!');
    }

    on(this.#mediaBoxTools, eventMaintenanceStateChanged, this.#onMaintenanceStateChanged.bind(this));
  }

  /**
   * @param {CustomEvent<string>} stateChangeEvent
   */
  #onMaintenanceStateChanged(stateChangeEvent) {
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
}

export function createMaintenanceStatusIcon() {
  const element = document.createElement('div');
  element.classList.add('maintenance-status-icon');

  new MaintenanceStatusIcon(element);

  return element;
}
