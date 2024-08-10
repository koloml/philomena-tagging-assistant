import {BaseComponent} from "$lib/components/base/BaseComponent.js";
import {getComponent} from "$lib/components/base/ComponentUtils.js";
import MiscSettings from "$lib/extension/settings/MiscSettings.js";

export class ImageShowFullscreenButton extends BaseComponent {
  /**
   * @type {MediaBoxTools}
   */
  #mediaBoxTools;
  #isFullscreenButtonEnabled = false;

  build() {
    this.container.innerText = '🔍';
    ImageShowFullscreenButton.#resolveFullscreenViewer();

    ImageShowFullscreenButton.#miscSettings ??= new MiscSettings();
  }

  init() {
    this.#mediaBoxTools = getComponent(this.container.parentElement);

    if (!this.#mediaBoxTools) {
      throw new Error('Fullscreen button is placed outside of the tools container!');
    }

    this.on('click', this.#onButtonClicked.bind(this));

    if (ImageShowFullscreenButton.#miscSettings) {
      ImageShowFullscreenButton.#miscSettings.resolveFullscreenViewerEnabled()
        .then(isEnabled => {
          this.#isFullscreenButtonEnabled = isEnabled;
          this.#updateFullscreenButtonVisibility();
        })
        .then(() => {
          ImageShowFullscreenButton.#miscSettings.subscribe(settings => {
            this.#isFullscreenButtonEnabled = settings.fullscreenViewer;
            this.#updateFullscreenButtonVisibility();
          })
        })
    }
  }

  #updateFullscreenButtonVisibility() {
    this.container.classList.toggle('is-visible', this.#isFullscreenButtonEnabled);
  }

  #onButtonClicked() {
    const imageViewer = ImageShowFullscreenButton.#resolveFullscreenViewer();
    const largeSourceUrl = this.#mediaBoxTools.mediaBox.imageLinks.large;

    let imageElement = imageViewer.querySelector('img');
    let videoElement = imageViewer.querySelector('video');

    if (imageElement) {
      imageElement.remove();
    }

    if (videoElement) {
      videoElement.remove();
    }

    if (largeSourceUrl.endsWith('.webm') || largeSourceUrl.endsWith('.mp4')) {
      videoElement ??= document.createElement('video');
      videoElement.src = largeSourceUrl;
      videoElement.volume = 0;
      videoElement.autoplay = true;
      videoElement.loop = true;
      videoElement.controls = true;

      imageViewer.appendChild(videoElement);
    } else {
      imageElement ??= document.createElement('img');
      imageElement.src = largeSourceUrl;

      imageViewer.appendChild(imageElement);
    }

    imageViewer.classList.add('shown');
  }

  /**
   * @type {HTMLElement|null}
   */
  static #fullscreenViewerElement = null;

  /**
   * @return {HTMLElement}
   */
  static #resolveFullscreenViewer() {
    this.#fullscreenViewerElement ??= this.#buildFullscreenViewer();
    return this.#fullscreenViewerElement;
  }

  /**
   * @return {HTMLElement}
   */
  static #buildFullscreenViewer() {
    const element = document.createElement('div');
    element.classList.add('fullscreen-viewer');

    document.body.append(element);

    document.addEventListener('keydown', event => {
      // When ESC pressed
      if (event.code === 'Escape' || event.code === 'Esc') {
        this.#closeFullscreenViewer(element);
      }
    });

    element.addEventListener('click', () => {
      this.#closeFullscreenViewer(element);
    });

    return element;
  }

  /**
   * @param {HTMLElement} [viewerElement]
   */
  static #closeFullscreenViewer(viewerElement = null) {
    viewerElement ??= this.#resolveFullscreenViewer();
    viewerElement.classList.remove('shown');

    /** @type {HTMLVideoElement} */
    const videoElement = viewerElement.querySelector('video');

    if (!videoElement) {
      return;
    }

    // Stopping and muting the video
    requestAnimationFrame(() => {
      videoElement.volume = 0;
      videoElement.pause();
      videoElement.remove();
    })
  }

  /**
   * @type {MiscSettings|null}
   */
  static #miscSettings = null;
}

export function createImageShowFullscreenButton() {
  const element = document.createElement('div');
  element.classList.add('media-box-show-fullscreen');

  new ImageShowFullscreenButton(element);

  return element;
}
