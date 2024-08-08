import {BaseComponent} from "$lib/components/base/BaseComponent.js";
import {SearchWrapper} from "$lib/components/SearchWrapper.js";

class SiteHeaderWrapper extends BaseComponent {
  /** @type {SearchWrapper|null} */
  #searchWrapper = null;

  build() {
    const searchForm = this.container.querySelector('.header__search');
    this.#searchWrapper = searchForm && new SearchWrapper(searchForm) || null;
  }

  init() {
    if (this.#searchWrapper) {
      this.#searchWrapper.initialize();
    }
  }
}

export function initializeSiteHeader(siteHeaderElement) {
  new SiteHeaderWrapper(siteHeaderElement)
    .initialize();
}
