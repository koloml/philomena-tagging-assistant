import MaintenanceSettings from "$lib/extension/settings/MaintenanceSettings.js";
import MaintenanceProfile from "$entities/MaintenanceProfile.js";
import {BaseComponent} from "$lib/components/base/BaseComponent.js";
import {getComponent} from "$lib/components/base/ComponentUtils.js";

export class MaintenancePopup extends BaseComponent {
  /** @type {HTMLElement} */
  #tagsListElement = null;

  /** @type {HTMLElement[]} */
  #tagsList = [];

  /** @type {MaintenanceProfile|null} */
  #activeProfile = null;

  /** @type {import('$lib/components/MediaBoxTools.js').MediaBoxTools} */
  #mediaBoxTools = null;

  /**
   * @protected
   */
  build() {
    this.container.innerHTML = '';
    this.container.classList.add('maintenance-popup');

    this.#tagsListElement = document.createElement('div');
    this.#tagsListElement.classList.add('tags-list');

    this.container.append(
      this.#tagsListElement,
    );
  }

  /**
   * @protected
   */
  init() {
    const mediaBoxToolsElement = this.container.closest('.media-box-tools');

    if (!mediaBoxToolsElement) {
      throw new Error('Maintenance popup initialized outside of the media box tools!');
    }

    /** @type {MediaBoxTools|null} */
    const mediaBoxTools = getComponent(mediaBoxToolsElement);

    if (!mediaBoxTools) {
      throw new Error('Media box tools component not found!');
    }

    this.#mediaBoxTools = mediaBoxTools;

    MaintenancePopup.#watchActiveProfile(this.#onActiveProfileChanged.bind(this));
    this.#tagsListElement.addEventListener('click', this.#handleTagClick.bind(this));
  }

  /**
   * @param {MaintenanceProfile|null} activeProfile
   */
  #onActiveProfileChanged(activeProfile) {
    this.#activeProfile = activeProfile;
    this.container.classList.toggle('is-active', activeProfile !== null);
    this.#refreshTagsList();
    this.emit('active-profile-changed', activeProfile);
  }

  #refreshTagsList() {
    /** @type {string[]} */
    const activeProfileTagsList = this.#activeProfile?.settings.tags || [];

    for (let tagElement of this.#tagsList) {
      tagElement.remove();
    }

    this.#tagsList = new Array(activeProfileTagsList.length);

    const currentPostTags = this.#mediaBoxTools.mediaBox.tagsAndAliases;

    activeProfileTagsList
      .sort((a, b) => a.localeCompare(b))
      .forEach((tagName, index) => {
        const tagElement = MaintenancePopup.#buildTagElement(tagName);
        this.#tagsList[index] = tagElement;
        this.#tagsListElement.appendChild(tagElement);

        const isPresent = currentPostTags.has(tagName);

        tagElement.classList.toggle('is-present', isPresent);
        tagElement.classList.toggle('is-missing', !isPresent);
        tagElement.classList.toggle('is-aliased', isPresent && currentPostTags.get(tagName) !== tagName);
      });
  }

  /**
   * Detect and process clicks made directly to the tags.
   * @param {MouseEvent} event
   */
  #handleTagClick(event) {
    /** @type {HTMLElement} */
    let tagElement = event.target;

    if (!tagElement.classList.contains('tag')) {
      tagElement = tagElement.closest('.tag');
    }

    if (!tagElement) {
      return;
    }

    if (tagElement.classList.contains('is-present')) {
      tagElement.classList.toggle('is-removed');
    }

    if (tagElement.classList.contains('is-missing')) {
      tagElement.classList.toggle('is-added');
    }

    // TODO: Execute the submission on timeout or after user moved the mouse away from the popup.
  }

  /**
   * @return {boolean}
   */
  get isActive() {
    return this.container.classList.contains('is-active');
  }

  /**
   * @param {string} tagName
   * @return {HTMLElement}
   */
  static #buildTagElement(tagName) {
    const tagElement = document.createElement('span');
    tagElement.classList.add('tag');
    tagElement.innerText = tagName;
    tagElement.dataset.name = tagName;

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

  new MaintenancePopup(container);

  return container;
}
