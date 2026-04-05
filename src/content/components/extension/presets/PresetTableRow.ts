import { BaseComponent } from "$content/components/base/BaseComponent";
import type TagEditorPreset from "$entities/TagEditorPreset";
import { emit } from "$content/components/events/comms";
import { EVENT_PRESET_TAG_CHANGE_APPLIED } from "$content/components/events/preset-block-events";
import { createFontAwesomeIcon } from "$lib/dom-utils";

export default class PresetTableRow extends BaseComponent {
  #preset: TagEditorPreset;
  #tagsList: HTMLElement[] = [];
  #applyAllButton = document.createElement('button');
  #removeAllButton = document.createElement('button');
  #alternateColorDummy = document.createElement('span');

  constructor(container: HTMLElement, preset: TagEditorPreset) {
    super(container);

    this.#preset = preset;
  }

  protected build() {
    this.#tagsList = this.#preset.settings.tags
      .toSorted((a, b) => a.localeCompare(b))
      .map(tagName => {
        const tagElement = document.createElement('span');
        tagElement.classList.add('tag');
        tagElement.textContent = tagName;
        tagElement.dataset.tagName = tagName;

        return tagElement;
      });

    const nameCell = document.createElement('td');
    nameCell.textContent = this.#preset.settings.name;

    const tagsCell = document.createElement('td');

    const tagsListContainer = document.createElement('div');
    tagsListContainer.classList.add('tag-list');
    tagsListContainer.append(...this.#tagsList);

    tagsCell.append(tagsListContainer);

    const actionsCell = document.createElement('td');

    const actionsContainer = document.createElement('div');
    actionsContainer.classList.add('flex', 'flex--gap-small');

    this.#applyAllButton.classList.add('button', 'button--state-success', 'button--bold');
    this.#applyAllButton.append(createFontAwesomeIcon('circle-plus'));
    this.#applyAllButton.title = 'Add all tags from this preset into the editor';

    this.#removeAllButton.classList.add('button', 'button--state-danger', 'button--bold');
    this.#removeAllButton.append(createFontAwesomeIcon('circle-minus'));
    this.#removeAllButton.title = 'Remove all tags from this preset from the editor';

    actionsContainer.append(
      this.#applyAllButton,
      this.#removeAllButton,
    );

    actionsCell.append(actionsContainer);

    this.container.append(
      nameCell,
      tagsCell,
      actionsCell,
    );

    this.#alternateColorDummy.style.display = 'none';
  }

  protected init() {
    for (const tagElement of this.#tagsList) {
      tagElement.addEventListener('click', this.#onTagClicked.bind(this));
    }

    this.#applyAllButton.addEventListener('click', this.#onApplyAllClicked.bind(this));
    this.#removeAllButton.addEventListener('click', this.#onRemoveAllClicked.bind(this));
  }

  #onTagClicked(event: Event) {
    const targetElement = event.currentTarget;

    if (!(targetElement instanceof HTMLElement)) {
      return;
    }

    const tagName = targetElement.dataset.tagName;
    const isMissing = targetElement.classList.contains(PresetTableRow.#tagMissingClassName);

    emit(this, EVENT_PRESET_TAG_CHANGE_APPLIED, {
      [isMissing ? 'addedTags' : 'removedTags']: new Set([tagName])
    });
  }

  #onApplyAllClicked(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    emit(this, EVENT_PRESET_TAG_CHANGE_APPLIED, {
      addedTags: new Set(this.#preset.settings.tags),
    });
  }

  #onRemoveAllClicked(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    emit(this, EVENT_PRESET_TAG_CHANGE_APPLIED, {
      removedTags: new Set(this.#preset.settings.tags),
    });
  }

  #maybeRefreshVisibilityFromTags(sourceTags: Set<string>) {
    if (!this.#preset.settings.conditional || this.#isMatchesConditional(sourceTags)) {
      this.container.style.display = '';
      this.#alternateColorDummy.remove();
      return;
    }

    this.container.style.display = 'none';
    this.container.after(this.#alternateColorDummy);
  }

  #isMatchesConditional(sourceTags: Set<string>): boolean {
    const listOfRequiredTags = this.#preset.settings.requiredTags;

    return Boolean(
      listOfRequiredTags.length
      && listOfRequiredTags.some(tagName => sourceTags.has(tagName))
    );
  }

  updateTags(tags: Set<string>) {
    for (const tagElement of this.#tagsList) {
      tagElement.classList.toggle(
        PresetTableRow.#tagMissingClassName,
        !tags.has(tagElement.dataset.tagName || ''),
      );
    }

    this.#maybeRefreshVisibilityFromTags(tags);
  }

  remove() {
    this.container.remove();
  }

  static create(preset: TagEditorPreset) {
    return new this(document.createElement('tr'), preset);
  }

  static #tagMissingClassName = 'is-missing';
}
