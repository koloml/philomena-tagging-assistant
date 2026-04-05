import TaggingProfilesPreferences from "$lib/extension/preferences/TaggingProfilesPreferences";
import TaggingProfile from "$entities/TaggingProfile";
import { BaseComponent } from "$content/components/base/BaseComponent";
import { getComponent } from "$content/components/base/component-utils";
import ScrapedAPI from "$lib/philomena/scraping/ScrapedAPI";
import { tagsBlacklist } from "$config/tags";
import { emitterAt } from "$content/components/events/comms";
import {
  EVENT_ACTIVE_PROFILE_CHANGED,
  EVENT_PROFILE_POPUP_STATE_CHANGED,
  EVENT_TAGS_UPDATED
} from "$content/components/events/tagging-profile-popup-events";
import type { MediaBoxTools } from "$content/components/extension/MediaBoxTools";
import { resolveTagCategoryFromTagName } from "$lib/philomena/tag-utils";

class BlackListedTagsEncounteredError extends Error {
  constructor(tagName: string) {
    super(`This tag is blacklisted and prevents submission: ${tagName}`, {
      cause: tagName
    });
  }
}

export class TaggingProfilePopup extends BaseComponent {
  #tagsListElement: HTMLElement = document.createElement('div');
  #tagsList: HTMLElement[] = [];
  #suggestedInvalidTags: Map<string, HTMLElement> = new Map();
  #activeProfile: TaggingProfile | null = null;
  #mediaBoxTools: MediaBoxTools | null = null;
  #tagsToRemove: Set<string> = new Set();
  #tagsToAdd: Set<string> = new Set();
  #isPlanningToSubmit: boolean = false;
  #isSubmitting: boolean = false;
  #tagsSubmissionTimer: Timeout | null = null;
  #emitter = emitterAt(this);

  /**
   * @protected
   */
  build() {
    this.container.innerHTML = '';
    this.container.classList.add('maintenance-popup');

    this.#tagsListElement.classList.add('tags-list');

    this.container.append(
      this.#tagsListElement,
    );
  }

  /**
   * @protected
   */
  init() {
    const mediaBoxToolsElement = this.container.closest<HTMLElement>('.media-box-tools');

    if (!mediaBoxToolsElement) {
      throw new Error('Maintenance popup initialized outside of the media box tools!');
    }

    const mediaBoxTools = getComponent<MediaBoxTools>(mediaBoxToolsElement);

    if (!mediaBoxTools) {
      throw new Error('Media box tools component not found!');
    }

    this.#mediaBoxTools = mediaBoxTools;

    TaggingProfilePopup.#watchActiveProfile(this.#onActiveProfileChanged.bind(this));
    this.#tagsListElement.addEventListener('click', this.#handleTagClick.bind(this));

    const mediaBox = this.#mediaBoxTools.mediaBox;

    if (!mediaBox) {
      throw new Error('Media box component not found!');
    }

    mediaBox.on('mouseout', this.#onMouseLeftArea.bind(this));
    mediaBox.on('mouseover', this.#onMouseEnteredArea.bind(this));
  }

  #onActiveProfileChanged(activeProfile: TaggingProfile | null) {
    this.#activeProfile = activeProfile;
    this.container.classList.toggle('is-active', activeProfile !== null);
    this.#refreshTagsList();

    this.#emitter.emit(EVENT_ACTIVE_PROFILE_CHANGED, activeProfile);
  }

  #refreshTagsList() {
    if (!this.#mediaBoxTools?.mediaBox) {
      return;
    }

    const activeProfileTagsList: string[] = this.#activeProfile?.settings.tags || [];

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
        const tagElement = TaggingProfilePopup.#buildTagElement(tagName);
        this.#tagsList[index] = tagElement;
        this.#tagsListElement.appendChild(tagElement);

        const isPresent = currentPostTags?.has(tagName);

        tagElement.classList.toggle('is-present', isPresent);
        tagElement.classList.toggle('is-missing', !isPresent);
        tagElement.classList.toggle('is-aliased', isPresent && currentPostTags?.get(tagName) !== tagName);

        // Just to prevent duplication, we need to include this tag to the map of suggested invalid tags
        if (tagsBlacklist.includes(tagName)) {
          TaggingProfilePopup.#markTagElementWithCategory(tagElement, 'error');
          this.#suggestedInvalidTags.set(tagName, tagElement);
        } else {
          TaggingProfilePopup.#markTagElementWithCategory(
            tagElement,
            resolveTagCategoryFromTagName(tagName) ?? '',
          );
        }
      });
  }

  /**
   * Detect and process clicks made directly to the tags.
   */
  #handleTagClick(event: MouseEvent) {
    const targetObject = event.target;


    if (!targetObject || !(targetObject instanceof HTMLElement)) {
      return;
    }

    let tagElement: HTMLElement | null = targetObject;

    if (!tagElement.classList.contains('tag')) {
      tagElement = tagElement.closest<HTMLElement>('.tag');
    }

    if (!tagElement?.dataset.name) {
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
        TaggingProfilePopup.#notifyAboutPendingSubmission(true);
      }

      this.#isPlanningToSubmit = true;
      this.#emitter.emit(EVENT_PROFILE_POPUP_STATE_CHANGED, 'waiting');
    }

    // Whenever user undoes the change they wanted to do in the popup, it's better to not send the submission and just
    // do nothing.
    if (!this.#tagsToAdd.size && !this.#tagsToRemove.size && this.#isPlanningToSubmit) {
      this.#isPlanningToSubmit = false;
      this.#emitter.emit(EVENT_PROFILE_POPUP_STATE_CHANGED, 'ready');
      TaggingProfilePopup.#notifyAboutPendingSubmission(false);

      // Probably shouldn't ever happen, but make sure we cancel any delayed submission.
      if (this.#tagsSubmissionTimer) {
        clearTimeout(this.#tagsSubmissionTimer);
      }
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
        TaggingProfilePopup.#delayBeforeSubmissionMs
      );
    }
  }

  async #onSubmissionTimerPassed() {
    if (!this.#isPlanningToSubmit || this.#isSubmitting || !this.#mediaBoxTools?.mediaBox) {
      return;
    }

    this.#isPlanningToSubmit = false;
    this.#isSubmitting = true;

    this.#emitter.emit(EVENT_PROFILE_POPUP_STATE_CHANGED, 'processing');

    let maybeTagsAndAliasesAfterUpdate;

    const shouldAutoRemove = await TaggingProfilePopup.#preferences.stripBlacklistedTags.get();

    try {
      maybeTagsAndAliasesAfterUpdate = await TaggingProfilePopup.#scrapedAPI.updateImageTags(
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

      TaggingProfilePopup.#notifyAboutPendingSubmission(false);

      this.#emitter.emit(EVENT_PROFILE_POPUP_STATE_CHANGED, 'failed');
      this.#isSubmitting = false;

      return;
    }

    if (maybeTagsAndAliasesAfterUpdate) {
      this.#emitter.emit(EVENT_TAGS_UPDATED, maybeTagsAndAliasesAfterUpdate);
    }

    this.#emitter.emit(EVENT_PROFILE_POPUP_STATE_CHANGED, 'complete');

    this.#tagsToAdd.clear();
    this.#tagsToRemove.clear();

    this.#refreshTagsList();
    TaggingProfilePopup.#notifyAboutPendingSubmission(false);

    this.#isSubmitting = false;
  }

  #revealInvalidTags() {
    if (!this.#mediaBoxTools?.mediaBox) {
      return;
    }

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

        const tagElement = TaggingProfilePopup.#buildTagElement(tagName);
        TaggingProfilePopup.#markTagElementWithCategory(tagElement, 'error');
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

  get isActive() {
    return this.container.classList.contains('is-active');
  }

  static create(): HTMLElement {
    const container = document.createElement('div');

    new this(container);

    return container;
  }

  static #buildTagElement(tagName: string): HTMLElement {
    const tagElement = document.createElement('span');
    tagElement.classList.add('tag');
    tagElement.innerText = tagName;
    tagElement.dataset.name = tagName;

    return tagElement;
  }

  /**
   * Mark the tag element with specified category.
   * @param tagElement Element to mark.
   * @param category Code name of category to mark.
   */
  static #markTagElementWithCategory(tagElement: HTMLElement, category: string) {
    tagElement.dataset.tagCategory = category;
    tagElement.setAttribute('data-tag-category', category);
  }

  /**
   * Controller with maintenance settings.
   */
  static #preferences = new TaggingProfilesPreferences();

  /**
   * Subscribe to all necessary feeds to watch for every active profile change. Additionally, will execute the callback
   * at the very start to retrieve the currently active profile.
   * @param callback Callback to execute whenever selection of active profile or profile itself has been changed.
   * @return Unsubscribe function. Call it to stop watching for changes.
   */
  static #watchActiveProfile(callback: (profile: TaggingProfile | null) => void): () => void {
    let lastActiveProfileId: string | null | undefined = null;

    const unsubscribeFromProfilesChanges = TaggingProfile.subscribe(profiles => {
      if (lastActiveProfileId) {
        callback(
          profiles.find(profile => profile.id === lastActiveProfileId) || null
        );
      }
    });

    const unsubscribeFromPreferences = this.#preferences.subscribe(settings => {
      if (settings.activeProfile === lastActiveProfileId) {
        return;
      }

      lastActiveProfileId = settings.activeProfile;

      this.#preferences.activeProfile.asObject()
        .then(callback);
    });

    this.#preferences.activeProfile.asObject()
      .then(profileOrNull => {
        if (profileOrNull) {
          lastActiveProfileId = profileOrNull.id;
        }

        callback(profileOrNull);
      });

    return () => {
      unsubscribeFromProfilesChanges();
      unsubscribeFromPreferences();
    }
  }

  /**
   * Notify the frontend about new pending submission started.
   * @param isStarted True if started, false if ended.
   */
  static #notifyAboutPendingSubmission(isStarted: boolean) {
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
   */
  static #pendingSubmissionCount: number|null = null;
}
