import MaintenanceSettings from "$lib/extension/settings/MaintenanceSettings.js";
import MaintenanceProfile from "$entities/MaintenanceProfile.js";

export class MaintenancePopup {
  /** @type {HTMLElement} */
  #container;

  /** @type {HTMLElement} */
  #tagsListElement;

  /** @type {HTMLElement[]} */
  #tagsList = [];

  /** @type {MaintenanceProfile|null} */
  #activeProfile = null;

  /**
   * @param {HTMLElement} container
   */
  constructor(container) {
    this.#container = container;
  }

  build() {
    this.#container.innerHTML = '';
    this.#container.classList.add('maintenance-popup');

    this.#tagsListElement = document.createElement('div');
    this.#tagsListElement.classList.add('tags-list');

    this.#container.append(
      this.#tagsListElement,
    );

    return this;
  }

  init() {
    MaintenancePopup.#watchActiveProfile(activeProfile => {
      this.#activeProfile = activeProfile;
      this.#container.classList.toggle('is-active', activeProfile !== null);
      this.#refreshTagsList();
    });
  }

  #refreshTagsList() {
    /** @type {string[]} */
    const activeProfileTagsList = this.#activeProfile?.settings.tags || [];

    for (let tagElement of this.#tagsList) {
      tagElement.remove();
    }

    this.#tagsList = new Array(activeProfileTagsList.length);

    activeProfileTagsList
      .sort((a, b) => a.localeCompare(b))
      .forEach((tagName, index) => {
        const tagElement = MaintenancePopup.#buildTagElement(tagName);
        this.#tagsList[index] = tagElement;
        this.#tagsListElement.appendChild(tagElement);
      });
  }

  /**
   * @param {string} tagName
   * @return {HTMLElement}
   */
  static #buildTagElement(tagName) {
    const tagElement = document.createElement('span');
    tagElement.classList.add('tag');
    tagElement.innerText = tagName;

    return tagElement;
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

      lastActiveProfileId = settings.activeProfileId;

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

export function createMaintenancePopup() {
  const container = document.createElement('div');

  new MaintenancePopup(container)
    .build()
    .init();

  return container;
}
