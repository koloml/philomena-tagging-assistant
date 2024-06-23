import {BaseComponent} from "$lib/components/base/BaseComponent.js";
import {getComponent} from "$lib/components/base/ComponentUtils.js";

export class ImageShowFullscreenButton extends BaseComponent {
  /**
   * @type {MediaBoxTools}
   */
  #mediaBoxTools;

  build() {
    this.container.innerText = '🔍';
    ImageShowFullscreenButton.#resolveFullscreenViewer();
  }

  init() {
    this.#mediaBoxTools = getComponent(this.container.parentElement);

    if (!this.#mediaBoxTools) {
      throw new Error('Fullscreen button is placed outside of the tools container!');
    }

    this.on('click', this.#onButtonClicked.bind(this));
  }

  #onButtonClicked() {
    const imageViewer = ImageShowFullscreenButton.#resolveFullscreenViewer();
    let imageElement = imageViewer.querySelector('img') ?? document.createElement('img');

    imageElement.src = this.#mediaBoxTools.mediaBox.imageLinks.large;
    imageViewer.appendChild(imageElement);

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
        element.classList.remove('shown');
      }
    });

    element.addEventListener('click', () => {
      element.classList.remove('shown');
    });

    return element;
  }
}

export function createImageShowFullscreenButton() {
  const element = document.createElement('div');
  element.classList.add('media-box-show-fullscreen');

  new ImageShowFullscreenButton(element);

  return element;
}
