import { BaseComponent } from "$content/components/base/BaseComponent";
import ImageContainer from "$content/components/philomena/ImageContainer";

export default class DupeImage extends BaseComponent {
  readonly imageContainer: ImageContainer;

  constructor(container: HTMLElement) {
    super(container);

    const imageContainerElement = container.querySelector<HTMLElement>('.image-container');

    if (!imageContainerElement) {
      throw new Error('Missing image container inside the dupe row!');
    }

    this.imageContainer = new ImageContainer(imageContainerElement);
    this.imageContainer.initialize();
  }
}
