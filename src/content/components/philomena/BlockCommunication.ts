import { BaseComponent } from "$content/components/base/BaseComponent";
import TagsPreferences from "$lib/extension/preferences/TagsPreferences";
import { getComponent } from "$content/components/base/component-utils";
import { resolveTagNameFromLink, resolveTagCategoryFromTagName } from "$lib/philomena/tag-utils";

export class BlockCommunication extends BaseComponent {
  #contentSection: HTMLElement | null = null;
  #tagLinks: HTMLAnchorElement[] = [];

  #tagLinksReplaced: boolean | null = null;
  #linkTextReplaced: boolean | null = null;

  protected build() {
    this.#contentSection = this.container.querySelector('.communication__content');
    this.#tagLinks = this.#findAllTagLinks();
  }

  protected init() {
    Promise.all([
      BlockCommunication.#preferences.replaceLinks.get(),
      BlockCommunication.#preferences.replaceLinkText.get(),
    ]).then(([replaceLinks, replaceLinkText]) => {
      this.#onReplaceLinkSettingResolved(
        replaceLinks,
        replaceLinkText
      );
    });

    BlockCommunication.#preferences.subscribe(settings => {
      this.#onReplaceLinkSettingResolved(
        settings.replaceLinks ?? false,
        settings.replaceLinkText ?? true
      );
    });
  }

  #onReplaceLinkSettingResolved(haveToReplaceLinks: boolean, shouldReplaceLinkText: boolean) {
    if (
      !this.#tagLinks.length
      || this.#tagLinksReplaced === haveToReplaceLinks
      && this.#linkTextReplaced === shouldReplaceLinkText
    ) {
      return;
    }

    for (const linkElement of this.#tagLinks) {
      linkElement.classList.toggle('tag', haveToReplaceLinks);

      // Sometimes tags are being decorated with the code block inside. It should be fine to replace it right away.
      if (linkElement.childElementCount === 1 && linkElement.children[0].tagName === 'CODE') {
        linkElement.textContent = linkElement.children[0].textContent;
      }

      /**
       * Resolved tag name. It should be stored for the text replacement.
       */
      let tagName: string | undefined;

      if (haveToReplaceLinks) {
        tagName = resolveTagNameFromLink(new URL(linkElement.href)) ?? '';
        linkElement.dataset.tagCategory = resolveTagCategoryFromTagName(tagName) ?? '';
      } else {
        linkElement.dataset.tagCategory = '';
      }

      this.#toggleTagLinkText(
        linkElement,
        haveToReplaceLinks && shouldReplaceLinkText,
        tagName,
      );
    }

    this.#tagLinksReplaced = haveToReplaceLinks;
    this.#linkTextReplaced = shouldReplaceLinkText;
  }

  /**
   * Swap the link text with the tag name or restore it back to original content. This function will only perform
   * replacement on links without any additional tags inside. This will ensure link won't break original content.
   * @param linkElement Element to swap the text on.
   * @param shouldSwapToTagName Should we swap the text to tag name or retore it back from memory.
   * @param tagName Tag name to swap the text to. If not provided, text will be swapped back.
   * @private
   */
  #toggleTagLinkText(linkElement: HTMLElement, shouldSwapToTagName: boolean, tagName?: string) {
    if (linkElement.childElementCount) {
      return;
    }

    // Make sure we save the original text to memory.
    if (!BlockCommunication.#originalTagLinkTexts.has(linkElement)) {
      BlockCommunication.#originalTagLinkTexts.set(linkElement, linkElement.textContent);
    }

    if (shouldSwapToTagName && tagName) {
      linkElement.textContent = tagName;
    } else {
      linkElement.textContent = BlockCommunication.#originalTagLinkTexts.get(linkElement) ?? linkElement.textContent;
    }
  }

  #findAllTagLinks(): HTMLAnchorElement[] {
    return Array
      .from(this.#contentSection?.querySelectorAll('a') || [])
      .filter(
        link =>
          // Support links pointing to the tag page.
          link.pathname.startsWith('/tags/')
          // Also capture link which point to the search results with single tag.
          || link.pathname.startsWith('/search')
          && link.search.includes('q=')
      );
  }

  static readonly #preferences = new TagsPreferences();

  /**
   * Map of links to their original texts. These texts need to be stored here to make them restorable. Keys is a link
   * element and value is a text.
   * @private
   */
  static readonly #originalTagLinkTexts: WeakMap<HTMLElement, string> = new WeakMap();

  static findAndInitializeAll() {
    for (const container of document.querySelectorAll<HTMLElement>('.block.communication')) {
      if (getComponent(container)) {
        continue;
      }

      new BlockCommunication(container).initialize();
    }
  }
}
