import { BaseComponent } from "$content/components/base/BaseComponent";
import { createFontAwesomeIcon } from "$lib/dom-utils";

const brandsSubtype = 'brands';

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

  /**
   * Mirroring of mapping from source URL domains to appropriate FontAwesome icons which is used in Philomena. Doesn't
   * match 1-to-1, but pretty close.
   *
   * Keys are the icons and values are the patterns extension should check for each URL.
   */
  static #iconsToPatternsMap = new Map<string[] | string, string[] | string>([
    [
      ['artstation', brandsSubtype],
      'artstation.com'
    ],
    [
      'bed',
      'pillowfort.social',
    ],
    [
      'bolt-lightning',
      'boosty.to',
    ],
    [
      ['bluesky', brandsSubtype],
      'bsky.app',
    ],
    [
      'brush',
      ['artfight.net', 'newgrounds.com'],
    ],
    [
      'coffee',
      ['ko-fi.com', 'buymeacoffee.com'],
    ],
    [
      ['deviantart', brandsSubtype],
      ['deviantart.com', 'sta.sh', 'fav.me'],
    ],
    [
      ['discord', brandsSubtype],
      ['discordapp.com', 'discord.com', 'discord.gg'],
    ],
    [
      'dove',
      'itaku.ee',
    ],
    [
      ['etsy', brandsSubtype],
      'etsy.com',
    ],
    [
      ['facebook', brandsSubtype],
      ['facebook.com', 'fb.me'],
    ],
    [
      ['flickr', brandsSubtype],
      'flickr.com',
    ],
    [
      ['instagram', brandsSubtype],
      'instagram.com',
    ],
    [
      ['mastodon', brandsSubtype],
      [
        'awoo.space',
        'bark.light',
        'equestria.social',
        'mastodon.social',
        'meow.social',
        'pawoo.net',
        'pettingzoo.co',
        'pony.social',
        'vulpine.club',
        'yiff.life',
        'socel.net',
        'octodon.social',
        'filly.social',
        'pone.social',
        'hooves.social',
        'baraag.net',
        'furries.club',
      ],
    ],
    [
      'palette',
      ['ych.art', 'commishes.com']
    ],
    [
      ['patreon', brandsSubtype],
      'patreon.com'
    ],
    [
      'paw',
      ['furaffinity.net', 'e621.net', 'furbooru.org', 'inkbunny.net', 'e926.net', 'sofurry.com', 'weasyl.co'],
    ],
    [
      ['pixiv', brandsSubtype],
      ['pixiv.net', 'pixiv.me'],
    ],
    [
      ['reddit', brandsSubtype],
      ['reddit.com', 'redd.it'],
    ],
    // Patreon piracy website, applying custom icon to easily catch such posts.
    [
      'skull-crossbones',
      'kemono.cr',
    ],
    [
      ['telegram', brandsSubtype],
      't.me',
    ],
    [
      ['tiktok', brandsSubtype],
      'tiktok.com'
    ],
    [
      ['tumblr', brandsSubtype],
      ['tumblr.com', 'tmblr.co', 'tumbex.com'],
    ],
    [
      ['vk', brandsSubtype],
      ['vk.com', 'vk.ru'],
    ],
    [
      ['x-twitter', brandsSubtype],
      ['x.com', 'twitter.com', 'twimg.com']
    ],
    [
      ['youtube', brandsSubtype],
      ['youtube.com', 'youtu.be'],
    ],
  ]);
}
