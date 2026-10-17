import TaggingProfilesPreferences from "$lib/extension/preferences/TaggingProfilesPreferences";
import TaggingProfile from "$entities/TaggingProfile";
import { BaseComponent } from "$content/components/base/BaseComponent";
import { getComponent } from "$content/components/base/component-utils";
import ScrapedAPI from "$lib/philomena/scraping/ScrapedAPI";
import { tagsBlacklist } from "$config/tags";
import { emitterAt, on } from "$content/components/events/comms";
import {
  EVENT_ACTIVE_PROFILE_CHANGED,
  EVENT_PROFILE_POPUP_STATE_CHANGED,
  EVENT_TAGS_UPDATED
} from "$content/components/events/tagging-profile-popup-events";
import type { MediaBoxTools } from "$content/components/extension/MediaBoxTools";
import TagsListToggler, { BlackListedTagsEncounteredError } from "$content/components/extension/profiles/TagsListToggler";
import { EVENT_TAG_TOGGLED } from "$content/components/events/tags-list-toggler-events";


export class TaggingProfilePopup extends BaseComponent {
  #tagsListToggler = TagsListToggler.create();
  #activeProfile: TaggingProfile | null = null;
  #mediaBoxTools: MediaBoxTools | null = null;
  #isSubmissionLocked: boolean = false;
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

    this.#tagsListToggler.initialize();
    this.container.append(this.#tagsListToggler.container);
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
    on(this.#tagsListToggler, EVENT_TAG_TOGGLED, this.#onTagToggled.bind(this));

    const mediaBox = this.#mediaBoxTools.mediaBox;

    if (!mediaBox) {
      throw new Error('Media box component not found!');
    }

    mediaBox.on('mouseout', this.#maybeEnqueueSubmission.bind(this));
    mediaBox.on('mouseover', this.#cancelQueuedSubmission.bind(this));
  }

  get tagsToggler() {
    return this.#tagsListToggler;
  }

  get activeProfile() {
    return this.#activeProfile;
  }

  toggleSubmissionLock(shouldLockSubmission: boolean) {
    this.#isSubmissionLocked = shouldLockSubmission;

    if (shouldLockSubmission) {
      this.#cancelQueuedSubmission();
      return;
    }

    // First notify that tags might have changed after submission lock was released and then enqueue it.
    this.#onTagToggled();
    this.#maybeEnqueueSubmission();
  }

  #onActiveProfileChanged(activeProfile: TaggingProfile | null) {
    this.#activeProfile = activeProfile;
    this.container.classList.toggle('is-active', activeProfile !== null);

    this.#refreshTagsToggler();

    this.#emitter.emit(EVENT_ACTIVE_PROFILE_CHANGED, activeProfile);
  }

  #refreshTagsToggler() {
    if (!this.#mediaBoxTools?.mediaBox) {
      return;
    }

    const activeProfileTagsList: string[] = this.#activeProfile?.settings.tags || [];
    const currentPostTags = new Set(this.#mediaBoxTools.mediaBox.tagsAndAliases?.keys() || []);

    this.#tagsListToggler.replaceTags(activeProfileTagsList, currentPostTags);
  }

  /**
   * Detect and process clicks made directly to the tags.
   */
  #onTagToggled() {
    const hasPendingChanges = this.#tagsListToggler.hasChanges;

    if (hasPendingChanges) {
      // Notify only once, when first planning to submit
      if (!this.#isPlanningToSubmit) {
        TaggingProfilePopup.#notifyAboutPendingSubmission(true);
      }

      this.#isPlanningToSubmit = true;
      this.#emitter.emit(EVENT_PROFILE_POPUP_STATE_CHANGED, 'waiting');
    }

    // Whenever user undoes the change they wanted to do in the popup, it's better to not send the submission and just
    // do nothing.
    if (!hasPendingChanges && this.#isPlanningToSubmit) {
      this.#isPlanningToSubmit = false;
      this.#emitter.emit(EVENT_PROFILE_POPUP_STATE_CHANGED, 'ready');
      TaggingProfilePopup.#notifyAboutPendingSubmission(false);

      // Probably shouldn't ever happen, but make sure we cancel any delayed submission.
      if (this.#tagsSubmissionTimer) {
        clearTimeout(this.#tagsSubmissionTimer);
      }
    }
  }

  #cancelQueuedSubmission() {
    if (this.#tagsSubmissionTimer) {
      clearTimeout(this.#tagsSubmissionTimer);
    }
  }

  #maybeEnqueueSubmission() {
    if (this.#isPlanningToSubmit && !this.#isSubmitting && !this.#isSubmissionLocked) {
      this.#tagsSubmissionTimer = setTimeout(
        this.#onSubmissionTimerPassed.bind(this),
        TaggingProfilePopup.#delayBeforeSubmissionMs
      );
    }
  }

  async #onSubmissionTimerPassed() {
    if (!this.#isPlanningToSubmit || this.#isSubmitting || !this.#mediaBoxTools?.mediaBox || this.#isSubmissionLocked) {
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
        this.#tagsListToggler.createTagsUpdater(shouldAutoRemove),
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

    this.#tagsListToggler.clearChangeSet();
    this.#refreshTagsToggler();
    TaggingProfilePopup.#notifyAboutPendingSubmission(false);

    this.#isSubmitting = false;
  }

  #revealInvalidTags() {
    if (!this.#mediaBoxTools?.mediaBox) {
      return;
    }

    const activeTags = new Set(this.#mediaBoxTools.mediaBox.tagsAndAliases?.keys() || []);

    if (!activeTags.size) {
      return;
    }

    this.#tagsListToggler.prependTags(tagsBlacklist.filter(tagName => activeTags.has(tagName)), activeTags);
  }

  static create(): HTMLElement {
    const container = document.createElement('div');

    new this(container);

    return container;
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
  static #pendingSubmissionCount: number | null = null;
}
