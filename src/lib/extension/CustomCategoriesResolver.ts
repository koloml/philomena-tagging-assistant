import type { TagDropdown } from "$content/components/philomena/TagDropdown";
import TagGroup from "$entities/TagGroup";
import { escapeRegExp } from "$lib/utils";
import { emit } from "$content/components/events/comms";
import { EVENT_TAG_GROUP_RESOLVED } from "$content/components/events/tag-dropdown-events";

export default class CustomCategoriesResolver {
  readonly #exactGroupMatches = new Map<string, TagGroup>();
  readonly #regExpGroupMatches = new Map<RegExp, TagGroup>();
  readonly #tagDropdowns: TagDropdown[] = [];
  #nextQueuedUpdate: Timeout | null = null;

  constructor() {
    TagGroup.subscribe(this.#onTagGroupsReceived.bind(this));
    TagGroup.readAll().then(this.#onTagGroupsReceived.bind(this));
  }

  public addElement(tagDropdown: TagDropdown): void {
    this.#tagDropdowns.push(tagDropdown);

    if (!this.#exactGroupMatches.size && !this.#regExpGroupMatches.size) {
      return;
    }

    this.#queueUpdatingTags();
  }

  #queueUpdatingTags() {
    if (this.#nextQueuedUpdate) {
      clearTimeout(this.#nextQueuedUpdate);
    }

    this.#nextQueuedUpdate = setTimeout(
      this.#updateUnprocessedTags.bind(this),
      CustomCategoriesResolver.#unprocessedTagsTimeout
    );
  }

  #updateUnprocessedTags() {
    this.#tagDropdowns
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
  #applyCustomCategoryForExactMatches(tagDropdown: TagDropdown): boolean {
    const tagName = tagDropdown.tagName!;

    if (!this.#exactGroupMatches.has(tagName)) {
      return true;
    }

    emit(
      tagDropdown,
      EVENT_TAG_GROUP_RESOLVED,
      this.#exactGroupMatches.get(tagName)!
    );

    return false;
  }

  #matchCustomCategoryByRegExp(tagDropdown: TagDropdown) {
    const tagName = tagDropdown.tagName!;

    for (const targetRegularExpression of this.#regExpGroupMatches.keys()) {
      if (!targetRegularExpression.test(tagName)) {
        continue;
      }

      emit(
        tagDropdown,
        EVENT_TAG_GROUP_RESOLVED,
        this.#regExpGroupMatches.get(targetRegularExpression)!
      );

      return false;
    }

    return true;
  }

  #onTagGroupsReceived(tagGroups: TagGroup[]) {
    this.#exactGroupMatches.clear();
    this.#regExpGroupMatches.clear();

    if (!tagGroups.length) {
      this.#queueUpdatingTags();
      return;
    }

    for (const tagGroup of tagGroups) {
      for (const tagName of tagGroup.settings.tags) {
        this.#exactGroupMatches.set(tagName, tagGroup);
      }

      for (const tagPrefix of tagGroup.settings.prefixes) {
        this.#regExpGroupMatches.set(
          new RegExp(`^${escapeRegExp(tagPrefix)}`),
          tagGroup,
        );
      }

      for (let tagSuffix of tagGroup.settings.suffixes) {
        this.#regExpGroupMatches.set(
          new RegExp(`${escapeRegExp(tagSuffix)}$`),
          tagGroup,
        );
      }
    }

    this.#queueUpdatingTags();
  }

  static #resetToOriginalCategory(tagDropdown: TagDropdown): void {
    emit(
      tagDropdown,
      EVENT_TAG_GROUP_RESOLVED,
      null,
    );
  }

  static readonly #unprocessedTagsTimeout = 0;
}
