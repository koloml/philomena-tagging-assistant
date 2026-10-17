import { BaseComponent } from "$content/components/base/BaseComponent";
import { CategoriesEnum, tagsBlacklist } from "$config/tags";
import { resolveTagCategoryFromTagName } from "$lib/philomena/tag-utils";
import { EVENT_TAG_TOGGLED } from "$content/components/events/tags-list-toggler-events";
import { emit } from "$content/components/events/comms";
import type { TagsUpdaterFunction } from "$lib/philomena/scraping/ScrapedAPI";

export default class TagsListToggler extends BaseComponent {
  #tagsList: HTMLElement[] = [];
  #invalidTagsList: Map<string, HTMLElement> = new Map();
  #tagsToAdd: Set<string> = new Set();
  #tagsToRemove: Set<string> = new Set();
  #renderedTags: Set<string> = new Set();

  protected build() {
    this.container.classList.add('tags-list');
  }

  protected init() {
    this.container.addEventListener('click', this.#handleTagClick.bind(this));
  }

  get hasChanges(): boolean {
    return (this.#tagsToAdd.size + this.#tagsToRemove.size) > 0;
  }

  replaceTags(tags: string[], activeTags: Set<string>) {
    for (const tagElement of this.#tagsList) {
      tagElement.remove();
    }

    for (const tagElement of this.#invalidTagsList.values()) {
      tagElement.remove();
    }

    this.#tagsList = [];
    this.#invalidTagsList = new Map();
    this.#renderedTags = new Set();

    this.#renderAndInsertTags(tags, activeTags);
  }

  prependTags(tags: string[], activeTags: Set<string>) {
    this.#renderAndInsertTags(tags, activeTags, true);
  }

  refreshStateFromChanges() {
    for (const tagElement of this.#tagsList) {
      const tagName = tagElement.dataset.name;

      if (!tagName) {
        throw new Error('Missing tag name!');
      }

      tagElement.classList.toggle(TagsListToggler.#addedClass, this.#tagsToAdd.has(tagName));
      tagElement.classList.toggle(TagsListToggler.#removedClass, this.#tagsToRemove.has(tagName));
    }
  }

  #renderAndInsertTags(toggleableTags: string[], activeTags: Set<string>, shouldPrepend: boolean = false) {
    toggleableTags.sort((a, b) => a.localeCompare(b));

    let lastInserted: HTMLElement | null = null;

    const hasStoredChanges = this.hasChanges;

    for (let tagIndex = 0; tagIndex < toggleableTags.length; tagIndex++) {
      const tagName = toggleableTags[tagIndex];

      if (this.#renderedTags.has(tagName)) {
        continue;
      }

      this.#renderedTags.add(tagName);

      const tagElement = TagsListToggler.#buildTagElement(tagName);

      this.#tagsList.push(tagElement);

      const isPresent = activeTags.has(tagName);

      tagElement.classList.toggle(TagsListToggler.#missingClass, !isPresent);
      tagElement.classList.toggle(TagsListToggler.#containsClass, isPresent);

      if (hasStoredChanges) {
        tagElement.classList.toggle(TagsListToggler.#addedClass, !isPresent && this.#tagsToAdd.has(tagName));
        tagElement.classList.toggle(TagsListToggler.#removedClass, isPresent && this.#tagsToRemove.has(tagName));
      }

      const tagCategory = tagsBlacklist.includes(tagName) && CategoriesEnum.Error
        || resolveTagCategoryFromTagName(tagName)
        || '';

      TagsListToggler.#markTagElementWithCategory(tagElement, tagCategory);

      if (tagCategory === CategoriesEnum.Error) {
        this.#invalidTagsList.set(tagName, tagElement);
      }

      if (shouldPrepend) {
        if (lastInserted) {
          lastInserted.after(tagElement);
        } else {
          this.container.prepend(tagElement);
        }

        lastInserted = tagElement;
      } else {
        this.container.append(tagElement);
      }
    }
  }

  createTagsUpdater(shouldAutoRemoveInvalid: boolean): TagsUpdaterFunction {
    return tagsList => {
      for (let tagName of this.#tagsToRemove) {
        tagsList.delete(tagName);
      }

      for (let tagName of this.#tagsToAdd) {
        tagsList.add(tagName);
      }

      if (shouldAutoRemoveInvalid) {
        for (let tagName of tagsBlacklist) {
          tagsList.delete(tagName);
        }
      } else {
        for (let tagName of tagsList) {
          if (tagsBlacklist.includes(tagName)) {
            throw new BlackListedTagsEncounteredError(tagName);
          }
        }
      }

      return tagsList;
    }
  }

  connectChangeSet(secondaryToggler: TagsListToggler) {
    secondaryToggler.#tagsToAdd = this.#tagsToAdd;
    secondaryToggler.#tagsToRemove = this.#tagsToRemove;
  }

  disconnectChangeSet() {
    this.#tagsToAdd = new Set(this.#tagsToAdd.values());
    this.#tagsToRemove = new Set(this.#tagsToRemove.values());
  }

  clearChangeSet() {
    this.#tagsToAdd.clear();
    this.#tagsToRemove.clear();
  }

  #handleTagClick(event: MouseEvent) {
    const targetObject = event.target;


    if (!targetObject || !(targetObject instanceof HTMLElement)) {
      return;
    }

    let tagElement: HTMLElement | null = targetObject;

    if (!tagElement.classList.contains('tag')) {
      tagElement = tagElement.closest<HTMLElement>('.tag');
    }

    if (!tagElement?.dataset.name) {
      return;
    }

    const tagName = tagElement.dataset.name;

    let willBeActive = false;

    if (tagElement.classList.contains(TagsListToggler.#containsClass)) {
      const isToBeRemoved = tagElement.classList.toggle(TagsListToggler.#removedClass);
      willBeActive = !isToBeRemoved;

      if (isToBeRemoved) {
        this.#tagsToRemove.add(tagName);
      } else {
        this.#tagsToRemove.delete(tagName);
      }
    }

    if (tagElement.classList.contains(TagsListToggler.#missingClass)) {
      const isToBeAdded = tagElement.classList.toggle(TagsListToggler.#addedClass);
      willBeActive = isToBeAdded;

      if (isToBeAdded) {
        this.#tagsToAdd.add(tagName);
      } else {
        this.#tagsToAdd.delete(tagName);
      }
    }

    emit(this.container, EVENT_TAG_TOGGLED, [tagName, willBeActive]);
  }

  static #buildTagElement(tagName: string): HTMLElement {
    const tagElement = document.createElement('span');
    tagElement.classList.add('tag');
    tagElement.innerText = tagName;
    tagElement.dataset.name = tagName;

    return tagElement;
  }

  /**
   * Mark the tag element with specified category.
   * @param tagElement Element to mark.
   * @param category Code name of category to mark.
   */
  static #markTagElementWithCategory(tagElement: HTMLElement, category: string) {
    tagElement.dataset.tagCategory = category;
    tagElement.setAttribute('data-tag-category', category);
  }

  static create(): TagsListToggler {
    const tagsListContainer = document.createElement('div');
    return new TagsListToggler(tagsListContainer);
  }

  static #containsClass = 'is-present';
  static #missingClass = 'is-missing';

  static #addedClass = 'is-added';
  static #removedClass = 'is-removed';
}

export class BlackListedTagsEncounteredError extends Error {
  constructor(tagName: string) {
    super(`This tag is blacklisted and prevents submission: ${tagName}`, {
      cause: tagName
    });
  }
}
