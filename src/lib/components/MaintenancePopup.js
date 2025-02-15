import MaintenanceSettings from "$lib/extension/settings/MaintenanceSettings";
import MaintenanceProfile from "$entities/MaintenanceProfile";
import { BaseComponent } from "$lib/components/base/BaseComponent";
import { getComponent } from "$lib/components/base/component-utils";
import ScrapedAPI from "$lib/booru/scraped/ScrapedAPI";
import { tagsBlacklist } from "$config/tags";
import { emitterAt } from "$lib/components/events/comms";
import {
  eventActiveProfileChanged,
  eventMaintenanceStateChanged,
  eventTagsUpdated
} from "$lib/components/events/maintenance-popup-events";

class BlackListedTagsEncounteredError extends Error {
  /**
   * @param {string} tagName
   */
  constructor(tagName) {
    super(`This tag is blacklisted and prevents submission: ${tagName}`);
  }
}

export class MaintenancePopup extends BaseComponent {
  /** @type {HTMLElement} */
  #tagsListElement = null;

  /** @type {HTMLElement[]} */
  #tagsList = [];

  /** @type {Map<string, HTMLElement>} */
  #suggestedInvalidTags = new Map();

  /** @type {MaintenanceProfile|null} */
  #activeProfile = null;

  /** @type {import('$lib/components/MediaBoxTools').MediaBoxTools} */
  #mediaBoxTools = null;

  /** @type {Set<string>} */
  #tagsToRemove = new Set();

  /** @type {Set<string>} */
  #tagsToAdd = new Set();

  /** @type {boolean} */
  #isPlanningToSubmit = false;

  /** @type {boolean} */
  #isSubmitting = false;

  /** @type {number|null} */
  #tagsSubmissionTimer = null;

  #emitter = emitterAt(this);

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

    const mediaBox = this.#mediaBoxTools.mediaBox;

    mediaBox.on('mouseout', this.#onMouseLeftArea.bind(this));
    mediaBox.on('mouseover', this.#onMouseEnteredArea.bind(this));
  }

  /**
   * @param {MaintenanceProfile|null} activeProfile
   */
  #onActiveProfileChanged(activeProfile) {
    this.#activeProfile = activeProfile;
    this.container.classList.toggle('is-active', activeProfile !== null);
    this.#refreshTagsList();

    this.#emitter.emit(eventActiveProfileChanged, activeProfile);
  }

  #refreshTagsList() {
    /** @type {string[]} */
    const activeProfileTagsList = this.#activeProfile?.settings.tags || [];

    for (const tagElement of this.#tagsList) {
      tagElement.remove();
    }

    for (const tagElement of this.#suggestedInvalidTags.values()) {
      tagElement.remove();
    }

    this.#tagsList = new Array(activeProfileTagsList.length);
    this.#suggestedInvalidTags.clear();

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

        // Just to prevent duplication, we need to include this tag to the map of suggested invalid tags
        if (tagsBlacklist.includes(tagName)) {
          MaintenancePopup.#markTagAsInvalid(tagElement);
          this.#suggestedInvalidTags.set(tagName, tagElement);
        }
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

    const tagName = tagElement.dataset.name;

    if (tagElement.classList.contains('is-present')) {
      const isToBeRemoved = tagElement.classList.toggle('is-removed');

      if (isToBeRemoved) {
        this.#tagsToRemove.add(tagName);
      } else {
        this.#tagsToRemove.delete(tagName);
      }
    }

    if (tagElement.classList.contains('is-missing')) {
      const isToBeAdded = tagElement.classList.toggle('is-added');

      if (isToBeAdded) {
        this.#tagsToAdd.add(tagName);
      } else {
        this.#tagsToAdd.delete(tagName);
      }
    }

    if (this.#tagsToAdd.size || this.#tagsToRemove.size) {
      // Notify only once, when first planning to submit
      if (!this.#isPlanningToSubmit) {
        MaintenancePopup.#notifyAboutPendingSubmission(true);
      }

      this.#isPlanningToSubmit = true;
      this.#emitter.emit(eventMaintenanceStateChanged, 'waiting');
    }
  }

  #onMouseEnteredArea() {
    if (this.#tagsSubmissionTimer) {
      clearTimeout(this.#tagsSubmissionTimer);
    }
  }

  #onMouseLeftArea() {
    if (this.#isPlanningToSubmit && !this.#isSubmitting) {
      this.#tagsSubmissionTimer = setTimeout(
        this.#onSubmissionTimerPassed.bind(this),
        MaintenancePopup.#delayBeforeSubmissionMs
      );
    }
  }

  async #onSubmissionTimerPassed() {
    if (!this.#isPlanningToSubmit || this.#isSubmitting) {
      return;
    }

    this.#isPlanningToSubmit = false;
    this.#isSubmitting = true;

    this.#emitter.emit(eventMaintenanceStateChanged, 'processing');

    let maybeTagsAndAliasesAfterUpdate;

    const shouldAutoRemove = await MaintenancePopup.#maintenanceSettings.resolveStripBlacklistedTags();

    try {
      maybeTagsAndAliasesAfterUpdate = await MaintenancePopup.#scrapedAPI.updateImageTags(
        this.#mediaBoxTools.mediaBox.imageId,
        tagsList => {
          for (let tagName of this.#tagsToRemove) {
            tagsList.delete(tagName);
          }

          for (let tagName of this.#tagsToAdd) {
            tagsList.add(tagName);
          }

          if (shouldAutoRemove) {
            for (let tagName of tagsBlacklist) {
              tagsList.delete(tagName);
            }
          } else {
            for (let tagName of tagsList) {
              if (tagsBlacklist.includes(tagName)) {
                throw new BlackListedTagsEncounteredError(tagName);
              }
            }
          }

          return tagsList;
        }
      );
    } catch (e) {
      if (e instanceof BlackListedTagsEncounteredError) {
        this.#revealInvalidTags();
      } else {
        console.warn('Tags submission failed:', e);
      }

      MaintenancePopup.#notifyAboutPendingSubmission(false);

      this.#emitter.emit(eventMaintenanceStateChanged, 'failed');
      this.#isSubmitting = false;

      return;
    }

    if (maybeTagsAndAliasesAfterUpdate) {
      this.#emitter.emit(eventTagsUpdated, maybeTagsAndAliasesAfterUpdate);
    }

    this.#emitter.emit(eventMaintenanceStateChanged, 'complete');

    this.#tagsToAdd.clear();
    this.#tagsToRemove.clear();

    this.#refreshTagsList();
    MaintenancePopup.#notifyAboutPendingSubmission(false);

    this.#isSubmitting = false;
  }

  #revealInvalidTags() {
    const tagsAndAliases = this.#mediaBoxTools.mediaBox.tagsAndAliases;

    if (!tagsAndAliases) {
      return;
    }

    const firstTagInList = this.#tagsList[0];

    for (let tagName of tagsBlacklist) {
      if (tagsAndAliases.has(tagName)) {
        if (this.#suggestedInvalidTags.has(tagName)) {
          continue;
        }

        const tagElement = MaintenancePopup.#buildTagElement(tagName);
        MaintenancePopup.#markTagAsInvalid(tagElement);
        tagElement.classList.add('is-present');

        this.#suggestedInvalidTags.set(tagName, tagElement);

        if (firstTagInList && firstTagInList.isConnected) {
          this.#tagsListElement.insertBefore(tagElement, firstTagInList);
        } else {
          this.#tagsListElement.appendChild(tagElement);
        }
      }
    }
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
   * Marks the tag with red color.
   * @param {HTMLElement} tagElement Element to mark.
   */
  static #markTagAsInvalid(tagElement) {
    tagElement.dataset.tagCategory = 'error';
    tagElement.setAttribute('data-tag-category', 'error');
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
    let lastActiveProfileId;

    const unsubscribeFromProfilesChanges = MaintenanceProfile.subscribe(profiles => {
      if (lastActiveProfileId) {
        callback(
          profiles.find(profile => profile.id === lastActiveProfileId) || null
        );
      }
    });

    const unsubscribeFromMaintenanceSettings = this.#maintenanceSettings.subscribe(settings => {
      if (settings.activeProfile === lastActiveProfileId) {
        return;
      }

      lastActiveProfileId = settings.activeProfile;

      this.#maintenanceSettings
        .resolveActiveProfileAsObject()
        .then(callback);
    });

    this.#maintenanceSettings
      .resolveActiveProfileAsObject()
      .then(profileOrNull => {
        if (profileOrNull) {
          lastActiveProfileId = profileOrNull.id;
        }

        callback(profileOrNull);
      });

    return () => {
      unsubscribeFromProfilesChanges();
      unsubscribeFromMaintenanceSettings();
    }
  }

  /**
   * Notify the frontend about new pending submission started.
   * @param {boolean} isStarted True if started, false if ended.
   */
  static #notifyAboutPendingSubmission(isStarted) {
    if (this.#pendingSubmissionCount === null) {
      this.#pendingSubmissionCount = 0;
      this.#initializeExitPromptHandler();
    }

    this.#pendingSubmissionCount += isStarted ? 1 : -1;
  }

  /**
   * Subscribe to the global window closing event, show the prompt when there are pending submission.
   */
  static #initializeExitPromptHandler() {
    window.addEventListener('beforeunload', event => {
      if (!this.#pendingSubmissionCount) {
        return;
      }

      event.preventDefault();
      event.returnValue = true;
    });
  }

  static #scrapedAPI = new ScrapedAPI();

  static #delayBeforeSubmissionMs = 500;

  /**
   * Amount of pending submissions or NULL if logic was not yet initialized.
   * @type {number|null}
   */
  static #pendingSubmissionCount = null;
}

export function createMaintenancePopup() {
  const container = document.createElement('div');

  new MaintenancePopup(container);

  return container;
}
