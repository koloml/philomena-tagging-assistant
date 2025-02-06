import type { TagDropdownWrapper } from "$lib/components/TagDropdownWrapper";
import TagGroup from "$entities/TagGroup";
import { escapeRegExp } from "$lib/utils";

export default class CustomCategoriesResolver {
  #tagCategories = new Map<string, string>();
  #compiledRegExps = new Map<RegExp, string>();
  #tagDropdowns: TagDropdownWrapper[] = [];
  #nextQueuedUpdate = -1;

  constructor() {
    TagGroup.subscribe(this.#onTagGroupsReceived.bind(this));
    TagGroup.readAll().then(this.#onTagGroupsReceived.bind(this));
  }

  public addElement(tagDropdown: TagDropdownWrapper): void {
    this.#tagDropdowns.push(tagDropdown);

    if (!this.#tagCategories.size && !this.#compiledRegExps.size) {
      return;
    }

    this.#queueUpdatingTags();
  }

  #queueUpdatingTags() {
    clearTimeout(this.#nextQueuedUpdate);

    this.#nextQueuedUpdate = setTimeout(
      this.#updateUnprocessedTags.bind(this),
      CustomCategoriesResolver.#unprocessedTagsTimeout
    );
  }

  #updateUnprocessedTags() {
    this.#tagDropdowns
      .filter(CustomCategoriesResolver.#skipTagsWithOriginalCategory)
      .filter(this.#applyCustomCategoryForExactMatches.bind(this))
      .filter(this.#matchCustomCategoryByRegExp.bind(this))
      .forEach(CustomCategoriesResolver.#resetToOriginalCategory);
  }

  /**
   * Apply custom categories for the exact tag names.
   * @param tagDropdown Element to try applying the category for.
   * @return {boolean} Will return false when tag is processed and true when it is not found.
   * @private
   */
  #applyCustomCategoryForExactMatches(tagDropdown: TagDropdownWrapper): boolean {
    const tagName = tagDropdown.tagName!;

    if (!this.#tagCategories.has(tagName)) {
      return true;
    }

    tagDropdown.tagCategory = this.#tagCategories.get(tagName)!;
    return false;
  }

  #matchCustomCategoryByRegExp(tagDropdown: TagDropdownWrapper) {
    const tagName = tagDropdown.tagName!;

    for (const targetRegularExpression of this.#compiledRegExps.keys()) {
      if (!targetRegularExpression.test(tagName)) {
        continue;
      }

      tagDropdown.tagCategory = this.#compiledRegExps.get(targetRegularExpression)!;
      return false;
    }

    return true;
  }

  #onTagGroupsReceived(tagGroups: TagGroup[]) {
    this.#tagCategories.clear();
    this.#compiledRegExps.clear();

    if (!tagGroups.length) {
      return;
    }

    for (const tagGroup of tagGroups) {
      const categoryName = tagGroup.settings.category;

      for (const tagName of tagGroup.settings.tags) {
        this.#tagCategories.set(tagName, categoryName);
      }

      for (const tagPrefix of tagGroup.settings.prefixes) {
        this.#compiledRegExps.set(
          new RegExp(`^${escapeRegExp(tagPrefix)}`),
          categoryName
        );
      }
    }

    this.#queueUpdatingTags();
  }

  static #skipTagsWithOriginalCategory(tagDropdown: TagDropdownWrapper): boolean {
    return !tagDropdown.originalCategory;
  }

  static #resetToOriginalCategory(tagDropdown: TagDropdownWrapper): void {
    tagDropdown.tagCategory = tagDropdown.originalCategory;
  }

  static #unprocessedTagsTimeout = 0;
}
