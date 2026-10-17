import { BaseComponent } from "$content/components/base/BaseComponent";
import MiscPreferences, { type FullscreenViewerSize } from "$lib/extension/preferences/MiscPreferences";
import { emit, on, type UnsubscribeFunction } from "$content/components/events/comms";
import { EVENT_SIZE_LOADED } from "$content/components/events/fullscreen-viewer-events";
import type { MediaBox } from "$content/components/philomena/MediaBox";
import TagsListToggler from "$content/components/extension/profiles/TagsListToggler";
import { EVENT_ACTIVE_PROFILE_CHANGED } from "$content/components/events/tagging-profile-popup-events";
import type TaggingProfile from "$entities/TaggingProfile";
import { EVENT_TAG_TOGGLED } from "$content/components/events/tags-list-toggler-events";
import type { TaggingProfilePopup } from "$content/components/extension/profiles/TaggingProfilePopup";

export class FullscreenViewer extends BaseComponent {
  #currentMediaBox: MediaBox | null = null;
  readonly #videoElement: HTMLVideoElement = document.createElement('video');
  readonly #imageElement: HTMLImageElement = document.createElement('img');
  readonly #spinnerElement: HTMLElement = document.createElement('i');
  readonly #sizeSelectorElement: HTMLSelectElement = document.createElement('select');
  readonly #closeButtonElement: HTMLElement = document.createElement('i');
  readonly #tagsPopupElement: HTMLElement = document.createElement('div');
  readonly #imageTagsToggler: TagsListToggler = TagsListToggler.create();
  readonly #profileTagsToggler: TagsListToggler = TagsListToggler.create();
  readonly #tagsPopupHider: HTMLElement = document.createElement('div');
  #activeProfileListenerUnsubscriber: UnsubscribeFunction | null = null;
  #touchId: number | null = null;
  #startX: number | null = null;
  #startY: number | null = null;
  #isClosingSwipeStarted: boolean | null = null;
  #isSizeFetched: boolean = false;

  protected build() {
    this.container.classList.add('fullscreen-viewer');

    this.#imageTagsToggler.initialize();
    this.#profileTagsToggler.initialize();

    const overflowContainer = document.createElement('div');
    overflowContainer.classList.add('tags-panel__scroller');

    overflowContainer.append(
      this.#profileTagsToggler.container,
      document.createElement('hr'),
      this.#imageTagsToggler.container,
    );

    this.#tagsPopupElement.append(
      this.#tagsPopupHider,
      overflowContainer,
    );

    this.#tagsPopupHider.classList.add('tags-panel__toggle');
    this.#tagsPopupHider.textContent = 'Toggle Tags';

    this.#tagsPopupElement.classList.add('tags-panel');

    this.container.append(
      this.#spinnerElement,
      this.#sizeSelectorElement,
      this.#closeButtonElement,
      this.#tagsPopupElement,
    );

    this.#spinnerElement.classList.add('spinner', 'fa', 'fa-circle-notch', 'fa-spin');
    this.#closeButtonElement.classList.add('close', 'fa', 'fa-xmark');
    this.#sizeSelectorElement.classList.add('size-selector', 'input');

    for (const [sizeKey, sizeName] of Object.entries(FullscreenViewer.#previewSizes)) {
      const sizeOptionElement = document.createElement('option');
      sizeOptionElement.value = sizeKey;
      sizeOptionElement.innerText = sizeName;

      this.#sizeSelectorElement.append(sizeOptionElement);
    }
  }

  /**
   * @protected
   */
  init() {
    document.addEventListener('keydown', this.#onDocumentKeyPressed.bind(this));
    this.on('click', this.#close.bind(this));

    this.on('touchstart', this.#onTouchStart.bind(this));
    this.on('touchmove', this.#onTouchMove.bind(this));
    this.on('touchend', this.#onTouchEnd.bind(this));

    this.#videoElement.addEventListener('loadeddata', this.#onLoaded.bind(this));
    this.#imageElement.addEventListener('load', this.#onLoaded.bind(this));
    this.#sizeSelectorElement.addEventListener('click', event => event.stopPropagation());
    this.#tagsPopupElement.addEventListener('click', event => event.stopPropagation());
    this.#tagsPopupHider.addEventListener('click', () => this.#togglePopupVisibility());

    FullscreenViewer.#preferences
      .fullscreenViewerSize.get()
      .then(this.#onSizeResolved.bind(this))
      .then(this.#watchForSizeSelectionChanges.bind(this));

    FullscreenViewer.#preferences
      .fullscreenViewerPopupShown.get()
      .then(this.#togglePopupVisibility.bind(this));

    on(this.#profileTagsToggler, EVENT_TAG_TOGGLED, this.#onTagToggled.bind(this));
    on(this.#imageTagsToggler, EVENT_TAG_TOGGLED, this.#onTagToggled.bind(this));
  }

  #onLoaded() {
    this.container.classList.remove('loading');
  }

  #onTouchStart(event: TouchEvent) {
    if (this.#touchId !== null) {
      return;
    }

    const firstTouch = event.touches.item(0);

    if (!firstTouch) {
      return;
    }

    this.#touchId = firstTouch.identifier;
    this.#startX = firstTouch.clientX;
    this.#startY = firstTouch.clientY;

    this.container.classList.add(FullscreenViewer.#swipeState);
  }

  #onTouchEnd(event: TouchEvent) {
    if (this.#touchId === null || this.#startY === null) {
      return;
    }

    const endedTouch = Array.from(event.changedTouches)
      .find(touch => touch.identifier === this.#touchId);

    if (!endedTouch) {
      return;
    }

    const verticalDistance = Math.abs(endedTouch.clientY - this.#startY);
    const requiredClosingDistance = window.innerHeight / 3;

    if (this.#isClosingSwipeStarted && verticalDistance > requiredClosingDistance) {
      this.#close();
    }

    this.#touchId = null;
    this.#startX = null;
    this.#startY = null;
    this.#isClosingSwipeStarted = null;

    this.container.classList.remove(FullscreenViewer.#swipeState);

    requestAnimationFrame(() => {
      this.container.style.removeProperty(FullscreenViewer.#offsetProperty);
      this.container.style.removeProperty(FullscreenViewer.#opacityProperty);
    });
  }

  #onTouchMove(event: TouchEvent) {
    if (this.#touchId === null || this.#startY === null || this.#startX === null) {
      return;
    }

    if (this.#isClosingSwipeStarted === false) {
      return;
    }

    for (const changedTouch of event.changedTouches) {
      if (changedTouch.identifier !== this.#touchId) {
        continue;
      }

      const verticalDistance = changedTouch.clientY - this.#startY;

      if (this.#isClosingSwipeStarted === null) {
        const horizontalDistance = changedTouch.clientX - this.#startX;

        if (Math.abs(verticalDistance) >= FullscreenViewer.#minRequiredDistance) {
          this.#isClosingSwipeStarted = true;
        } else if (Math.abs(horizontalDistance) >= FullscreenViewer.#minRequiredDistance) {
          this.#isClosingSwipeStarted = false;
          break;
        } else {
          break;
        }
      }

      this.container.style.setProperty(
        FullscreenViewer.#offsetProperty,
        verticalDistance.toString().concat('px')
      );

      const maxDistance = window.innerHeight * 2;
      let opacity = 1;

      if (verticalDistance !== 0) {
        opacity -= Math.min(1, Math.abs(verticalDistance) / maxDistance);
      }

      this.container.style.setProperty(
        FullscreenViewer.#opacityProperty,
        opacity.toString()
      );

      break;
    }
  }

  #onDocumentKeyPressed(event: KeyboardEvent) {
    if (event.code === 'Escape' || event.code === 'Esc') {
      this.#close();
    }
  }

  #onSizeResolved(size: FullscreenViewerSize) {
    this.#sizeSelectorElement.value = size;
    this.#isSizeFetched = true;

    emit(this.container, EVENT_SIZE_LOADED, size);
  }

  #watchForSizeSelectionChanges() {
    let lastActiveSize = this.#sizeSelectorElement.value;

    FullscreenViewer.#preferences.subscribe(settings => {
      const targetSize = settings.fullscreenViewerSize;

      if (!targetSize || lastActiveSize === targetSize) {
        return;
      }

      lastActiveSize = targetSize;
      this.#sizeSelectorElement.value = targetSize;
    });

    this.#sizeSelectorElement.addEventListener('input', () => {
      const targetSize = this.#sizeSelectorElement.value;

      if (this.#currentMediaBox) {
        void this.show(this.#currentMediaBox);
      }

      if (!targetSize || targetSize === lastActiveSize || !(targetSize in FullscreenViewer.#previewSizes)) {
        return;
      }

      lastActiveSize = targetSize;
      void FullscreenViewer.#preferences.fullscreenViewerSize.set(targetSize as FullscreenViewerSize);
    });
  }

  #onTagToggled(event: CustomEvent<[string, boolean]>) {
    const sourceTogglerContainer = event.currentTarget;

    if (!(sourceTogglerContainer instanceof HTMLElement)) {
      return;
    }

    if (sourceTogglerContainer !== this.#imageTagsToggler.container) {
      this.#imageTagsToggler.refreshStateFromChanges();
    }

    if (sourceTogglerContainer !== this.#profileTagsToggler.container) {
      this.#profileTagsToggler.refreshStateFromChanges();
    }

    this.#currentMediaBox?.tools?.popup?.tagsToggler.refreshStateFromChanges();
  }

  #onActiveProfileChanged(eventOrTaggingProfile: CustomEvent<TaggingProfile | null> | TaggingProfile | null) {
    let resolvedActiveTaggingProfile: TaggingProfile | null = null;

    if (eventOrTaggingProfile instanceof CustomEvent) {
      resolvedActiveTaggingProfile = eventOrTaggingProfile.detail;
    } else {
      resolvedActiveTaggingProfile = eventOrTaggingProfile;
    }

    this.#profileTagsToggler.container.classList.toggle('is-hidden', !resolvedActiveTaggingProfile);

    if (!resolvedActiveTaggingProfile) {
      return;
    }

    const uniqueTagsSet = this.#currentMediaBox?.uniqueTagsSet;

    this.#profileTagsToggler.replaceTags(resolvedActiveTaggingProfile.settings.tags, uniqueTagsSet ?? new Set());
  }

  #close() {
    const taggingPopup = this.#currentMediaBox?.tools?.popup;

    if (taggingPopup) {
      this.#activeProfileListenerUnsubscriber?.();

      taggingPopup.tagsToggler.disconnectChangeSet();
      taggingPopup.toggleSubmissionLock(false);
    }

    this.#currentMediaBox = null;

    this.container.classList.remove(FullscreenViewer.#shownState);
    document.body.style.removeProperty('overflow');

    requestAnimationFrame(() => {
      this.#videoElement.volume = 0;
      this.#videoElement.pause();
      this.#videoElement.remove();
    });
  }

  async #resolveCurrentSelectedSizeUrl(imageUris: App.ImageURIs): Promise<string | null> {
    if (!this.#isSizeFetched) {
      await new Promise(
        resolve => on(
          this.container,
          EVENT_SIZE_LOADED,
          resolve
        ),
      );
    }

    let targetSize: FullscreenViewerSize | string = this.#sizeSelectorElement.value;

    if (!imageUris.hasOwnProperty(targetSize)) {
      targetSize = FullscreenViewer.#fallbackSize;
    }

    if (!imageUris.hasOwnProperty(targetSize)) {
      targetSize = Object.keys(imageUris)[0];
    }

    if (!targetSize) {
      return null;
    }

    return imageUris[targetSize as FullscreenViewerSize];
  }

  async show(mediaBox: MediaBox): Promise<void> {
    const isSameMediaBox = this.#currentMediaBox === mediaBox;
    this.#currentMediaBox = mediaBox;

    const url = await this.#resolveCurrentSelectedSizeUrl(mediaBox.imageLinks);

    if (!url) {
      console.warn('Failed to resolve media for the viewer!');
      return;
    }

    const taggingPopup = mediaBox?.tools?.popup;

    if (taggingPopup && !isSameMediaBox) {
      this.#connectAndRefreshTagTogglers(taggingPopup, mediaBox);
    }

    this.container.classList.add('loading');

    requestAnimationFrame(() => {
      this.container.classList.add(FullscreenViewer.#shownState);
      document.body.style.overflow = 'hidden';
    });

    if (FullscreenViewer.#isVideoUrl(url)) {
      this.#imageElement.remove();

      this.#videoElement.src = url;
      this.#videoElement.volume = 0;
      this.#videoElement.autoplay = true;
      this.#videoElement.loop = true;
      this.#videoElement.controls = true;

      this.container.append(this.#videoElement);

      return;
    }

    this.#videoElement.remove();

    this.#imageElement.src = url;

    this.container.append(this.#imageElement);
  }

  /**
   * When connecting to the new popup, we need to connect the tag editor inside the fullscreen viewer to the original
   * popup, since submission is still being sent from the popup inside media box.
   * @param taggingPopup
   * @param mediaBox
   * @private
   */
  #connectAndRefreshTagTogglers(taggingPopup: TaggingProfilePopup, mediaBox: MediaBox) {
    taggingPopup.toggleSubmissionLock(true);

    const sourceToggler = taggingPopup.tagsToggler;
    sourceToggler.connectChangeSet(this.#profileTagsToggler);
    sourceToggler.connectChangeSet(this.#imageTagsToggler);

    const uniqueTagsSet = mediaBox.uniqueTagsSet ?? new Set();
    const uniqueTags = Array.from(uniqueTagsSet);

    this.#imageTagsToggler.replaceTags(uniqueTags, uniqueTagsSet);

    this.#activeProfileListenerUnsubscriber?.();
    this.#activeProfileListenerUnsubscriber = on(
      taggingPopup,
      EVENT_ACTIVE_PROFILE_CHANGED,
      this.#onActiveProfileChanged.bind(this),
    );

    this.#onActiveProfileChanged(taggingPopup.activeProfile);
  }

  #togglePopupVisibility(maybeState: boolean | undefined = undefined) {
    if (maybeState === undefined) {
      const isHidden = this.#tagsPopupElement.classList.toggle(FullscreenViewer.#collapsedPopupState);
      void FullscreenViewer.#preferences.fullscreenViewerPopupShown.set(!isHidden);
      return;
    }

    this.#tagsPopupElement.classList.toggle(FullscreenViewer.#collapsedPopupState, !maybeState);
  }

  static #isVideoUrl(url: string): boolean {
    return url.endsWith('.mp4') || url.endsWith('.webm');
  }

  static readonly #preferences = new MiscPreferences();

  static readonly #offsetProperty = '--offset';
  static readonly #opacityProperty = '--opacity';
  static readonly #shownState = 'shown';
  static readonly #swipeState = 'swiped';
  static readonly #minRequiredDistance = 50;
  static readonly #collapsedPopupState = 'is-collapsed';

  static readonly #previewSizes: Record<FullscreenViewerSize, string> = {
    full: 'Full',
    large: 'Large',
    medium: 'Medium',
    small: 'Small'
  }

  static readonly #fallbackSize = 'large';
}
