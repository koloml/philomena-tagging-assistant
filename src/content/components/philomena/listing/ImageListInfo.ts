import { BaseComponent } from "$content/components/base/BaseComponent";

export class ImageListInfo extends BaseComponent {
  #tagElement: HTMLElement | null = null;
  readonly #impliedTags: string[] = [];
  readonly #showUntaggedImplicationsButton: HTMLAnchorElement = document.createElement('a');

  protected build() {
    const sectionAfterImage = this.container.querySelector('.tag-info__image + .flex__grow');

    this.#tagElement = sectionAfterImage?.querySelector<HTMLElement>('.tag.dropdown') ?? null;

    const labels = this.container
      .querySelectorAll<HTMLElement>('.tag-info__image + .flex__grow strong');

    let targetElementToInsertBefore: HTMLElement | null = null;

    for (const potentialListStarter of labels) {
      if (potentialListStarter.innerText === ImageListInfo.#implicationsStarterText) {
        targetElementToInsertBefore = potentialListStarter;
        this.#collectImplicationsFromListStarter(potentialListStarter);
        break;
      }
    }

    if (this.#impliedTags.length && targetElementToInsertBefore) {
      this.#showUntaggedImplicationsButton.href = '#';
      this.#showUntaggedImplicationsButton.innerText = '(Q)';
      this.#showUntaggedImplicationsButton.title =
        'Query untagged implications\n\n' +
        'This will open the search results with all untagged implications for the current tag.';
      this.#showUntaggedImplicationsButton.classList.add('detail-link');

      targetElementToInsertBefore.insertAdjacentElement('beforebegin', this.#showUntaggedImplicationsButton);
    }
  }

  protected init() {
    this.#showUntaggedImplicationsButton.addEventListener('click', this.#onShowUntaggedImplicationsClicked.bind(this));
  }

  #collectImplicationsFromListStarter(listStarter: HTMLElement) {
    let targetElement: Element | null = listStarter.nextElementSibling;

    while (targetElement) {
      if (targetElement instanceof HTMLAnchorElement) {
        this.#impliedTags.push(targetElement.innerText.trim());
      }

      // First line break is considered the end of the list.
      if (targetElement instanceof HTMLBRElement) {
        break;
      }

      targetElement = targetElement.nextElementSibling;
    }
  }

  #onShowUntaggedImplicationsClicked(event: Event) {
    event.preventDefault();

    const url = new URL(window.location.href);

    url.pathname = '/search';
    url.search = '';

    const currentTagName = this.#tagElement?.dataset.tagName;

    url.searchParams.set('q', `${currentTagName}, !(${this.#impliedTags.join(", ")})`);

    location.assign(url.href);
  }

  static readonly #implicationsStarterText = 'Implies:';
}
