import { BaseComponent } from "$content/components/base/BaseComponent";
import { getComponent } from "$content/components/base/component-utils";
import MiscPreferences from "$lib/extension/preferences/MiscPreferences";
import { FullscreenViewer } from "$content/components/extension/FullscreenViewer";
import type { MediaBoxTools } from "$content/components/extension/MediaBoxTools";

export class ImageShowFullscreenButton extends BaseComponent {
  #mediaBoxTools: MediaBoxTools | null = null;
  #isFullscreenButtonEnabled: boolean = false;

  protected build() {
    this.container.innerText = '🔍';
  }

  protected init() {
    if (!this.container.parentElement) {
      throw new Error('Missing parent element!');
    }

    this.#mediaBoxTools = getComponent(this.container.parentElement);

    if (!this.#mediaBoxTools) {
      throw new Error('Fullscreen button is placed outside of the tools container!');
    }

    this.on('click', this.#onButtonClicked.bind(this));

    if (ImageShowFullscreenButton.#preferences) {
      ImageShowFullscreenButton.#preferences.fullscreenViewer.get()
        .then(isEnabled => {
          this.#isFullscreenButtonEnabled = isEnabled;
          this.#updateFullscreenButtonVisibility();
        })
        .then(() => {
          ImageShowFullscreenButton.#preferences?.subscribe(settings => {
            this.#isFullscreenButtonEnabled = settings.fullscreenViewer ?? true;
            this.#updateFullscreenButtonVisibility();
          })
        })
    }
  }

  #updateFullscreenButtonVisibility() {
    this.container.classList.toggle('is-visible', this.#isFullscreenButtonEnabled);
  }

  #onButtonClicked() {
    const mediaBox = this.#mediaBoxTools?.mediaBox;

    if (!mediaBox) {
      throw new Error('Failed to resolve image links from media box tools!');
    }

    ImageShowFullscreenButton.#resolveViewer()?.show(mediaBox);
  }

  static create(): HTMLElement {
    const element = document.createElement('div');
    element.classList.add('media-box-show-fullscreen');

    new ImageShowFullscreenButton(element);

    return element;
  }

  static #viewer: FullscreenViewer | null = null;

  static #resolveViewer(): FullscreenViewer {
    this.#viewer ??= this.#buildViewer();
    return this.#viewer;
  }

  static #buildViewer(): FullscreenViewer {
    const element = document.createElement('div');
    const viewer = new FullscreenViewer(element);

    viewer.initialize();

    document.body.append(element);

    return viewer;
  }

  static readonly #preferences = new MiscPreferences();
}
