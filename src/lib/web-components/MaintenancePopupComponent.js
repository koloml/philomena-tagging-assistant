import MaintenanceProfile from "$entities/MaintenanceProfile.js";
import MaintenanceSettings from "$lib/extension/settings/MaintenanceSettings.js";

export default class MaintenancePopupComponent extends HTMLElement {
  /**
   * Unsubscribe function used on connection to the DOM.
   * @type {(function(): void)|null}
   */
  #watcherDestroyer = null;

  /**
   * @type {MaintenanceProfile|null}
   */
  #activeProfile = null;

  /**
   * @type {HTMLElement[]}
   */
  #tagsList = [];

  constructor() {
    super();
  }

  connectedCallback() {
    this.#watcherDestroyer = MaintenancePopupComponent.#watchActiveProfile(activeProfile => {
      this.#activeProfile = activeProfile;

      this.#refreshTagsList();
    });
  }

  disconnectedCallback() {
    if (this.#watcherDestroyer) {
      this.#watcherDestroyer();
      this.#watcherDestroyer = null;
    }

    this.innerHTML = '';
    this.#tagsList = [];
  }

  #refreshTagsList() {
    /** @type {string[]} */
    const activeProfileTagsList = this.#activeProfile?.settings.tags || [];

    for (let tagElement of this.#tagsList) {
      tagElement.remove();
    }

    this.#tagsList = new Array(activeProfileTagsList.length);

    activeProfileTagsList
      .sort((a, b) => b.localeCompare(a))
      .forEach((tagName, index) => {
        const tagElement = document.createElement('span');
        tagElement.classList.add('tag');
        tagElement.innerText = tagName;

        this.#tagsList[index] = tagElement;

        this.appendChild(tagElement);
      });
  }

  /**
   * Controller with maintenance settings.
   * @type {MaintenanceSettings}
   */
  static #maintenanceSettings = new MaintenanceSettings();

  /**
   * Subscribe to all necessary feeds to watch for every active profile change. Additionally, will execute the callback
   * at the very start to retrieve the currently active profile.
   * @param {function(MaintenanceProfile|null):void} callback Callback to execute whenever selection of active profile
   * or profile itself has been changed.
   * @return {function(): void} Unsubscribe function. Call it to stop watching for changes.
   */
  static #watchActiveProfile(callback) {
    let lastActiveProfileId = null;

    const unsubscribeFromProfilesChanges = MaintenanceProfile.subscribe(profiles => {
      if (lastActiveProfileId) {
        callback(
          profiles.find(profile => profile.id === lastActiveProfileId) || null
        );
      }
    });

    const unsubscribeFromMaintenanceSettings = MaintenanceSettings.subscribe(settings => {
      if (settings.activeProfileId === lastActiveProfileId) {
        return;
      }

      this.#maintenanceSettings
        .resolveActiveProfileAsObject()
        .then(callback);
    });

    this.#maintenanceSettings
      .resolveActiveProfileAsObject()
      .then(callback);

    return () => {
      unsubscribeFromProfilesChanges();
      unsubscribeFromMaintenanceSettings();
    }
  }
}

if (!customElements.get('maintenance-popup')) {
  customElements.define('maintenance-popup', MaintenancePopupComponent);
} else {
  console.warn('maintenance-popup component is already defined');
}
