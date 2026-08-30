import { BaseComponent } from "$content/components/base/BaseComponent";
import { createFontAwesomeIcon } from "$lib/dom-utils";

const brandsSubtype = 'brands';

const blueskyIcon = ['bluesky', brandsSubtype];
const twitterIcon = ['x-twitter', brandsSubtype];

export default class DupeDiff extends BaseComponent {
  #sourcesLine: HTMLElement | null = null;
  #ratingsLine: HTMLElement | null = null;

  protected init() {
    const {
      "6": sourcesLine,
      "7": ratingsLine,
    } = this.container.querySelectorAll<HTMLElement>('table tr > td')

    this.#sourcesLine = sourcesLine;
    this.#ratingsLine = ratingsLine;
  }

  renderSources(leftSources: string[], rightSources: string[]): void {
    if (!this.#sourcesLine) {
      console.error("Can't render sources since no sources line in diff fonud!");
      return;
    }

    for (const childElement of this.#sourcesLine.children) {
      childElement.remove();
    }

    const sourceIconsContainer = document.createElement('span');
    sourceIconsContainer.classList.add('source-icons');

    sourceIconsContainer.append(
      this.#renderSourceIcons(leftSources),
      " vs ",
      this.#renderSourceIcons(rightSources),
    );

    this.#sourcesLine.append(sourceIconsContainer);
  }

  renderRatings(leftRating: string | null, rightRating: string | null) {
    if (!this.#ratingsLine) {
      return;
    }

    for (const childElement of this.#ratingsLine.children) {
      childElement.remove();
    }

    if (leftRating === rightRating) {
      return;
    }

    const ratingDifference = document.createElement('span');
    ratingDifference.classList.add('ratings-difference');
    ratingDifference.textContent = `(${leftRating || '(none)'} vs ${rightRating || '(none)'})`;

    this.#ratingsLine.append(ratingDifference);
  }

  #renderSourceIcons(sourcesList: string[]): HTMLElement {
    const iconsContainer = document.createElement('span');
    iconsContainer.classList.add('source-icons__list');

    for (const sourceUrl of sourcesList) {
      iconsContainer.append(this.#renderIcon(sourceUrl));
    }

    if (!sourcesList.length) {
      iconsContainer.append('(none)');
    }

    return iconsContainer;
  }

  #renderIcon(url: string): HTMLElement {
    let iconSlug = 'globe';
    let maybeSubtype: string | undefined;

    for (const [iconOrIconWithSubtype, singleOrMultiPattern] of DupeDiff.#iconsToPatternsMap) {
      if (
        typeof singleOrMultiPattern === 'string' && url.includes(singleOrMultiPattern)
        || Array.isArray(singleOrMultiPattern) && singleOrMultiPattern.some(singlePattern => url.includes(singlePattern))
      ) {
        if (Array.isArray(iconOrIconWithSubtype)) {
          [iconSlug, maybeSubtype] = iconOrIconWithSubtype;
        } else {
          iconSlug = iconOrIconWithSubtype;
        }
        break;
      }
    }

    const sourceIcon = createFontAwesomeIcon(iconSlug, maybeSubtype);
    sourceIcon.title = url;

    return sourceIcon;
  }

  static #iconsToPatternsMap = new Map<string[] | string, string[] | string>([
    [blueskyIcon, 'bsky.app'],
    ['paw', 'furaffinity.net'],
    [twitterIcon, ['x.com', 'twitter.com']],
  ]);
}
