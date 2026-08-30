import { BaseComponent } from "$content/components/base/BaseComponent";

export default class ImageContainer extends BaseComponent {
  #imageLink: HTMLAnchorElement | null = null;

  protected init() {
    this.#imageLink = this.container.querySelector('a');
  }

  extractActualTags(): string[] {
    return this.#imageLink?.title.split(' | Tagged: ')[1]?.split(', ') || [];
  }

  extractTagsAndAliases(): string[] {
    return this.container.dataset.imageTagAliases?.split(', ') || [];
  }

  extractImageLinks(): App.ImageURIs {
    const jsonUris = this.container?.dataset.uris;

    if (!jsonUris) {
      throw new Error('Missing URIs!');
    }

    return JSON.parse(jsonUris);
  }
}
