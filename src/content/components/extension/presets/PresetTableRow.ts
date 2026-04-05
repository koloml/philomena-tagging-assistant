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
  #exclusiveWarning = document.createElement('div');

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
    tagsCell.style.width = '70%';

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

    if (this.#preset.settings.exclusive) {
      this.#applyAllButton.disabled = true;
      this.#applyAllButton.title = "You can't add all tags from this preset since it only allows one tag to be active";

      this.#exclusiveWarning.classList.add('block', 'block--fixed', 'block--warning');
      this.#exclusiveWarning.textContent = ' Multiple tags from this preset present in the editor! If you will click one of the tags here, other tags will be cleared automatically.'
      this.#exclusiveWarning.prepend(createFontAwesomeIcon('triangle-exclamation'));
      this.#exclusiveWarning.style.display = 'none';

      tagsCell.append(this.#exclusiveWarning);
    }

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

    if (!tagName) {
      return;
    }

    // If a user clicks on the tag which was missing, then we have to remove all other active tags that are in this
    // preset. But only when clicking on a tag which is missing, just so they will be able to remove any cases where
    // multiple tags from exclusive present are active.
    if (this.#preset.settings.exclusive && isMissing) {
      const tagNamesToRemove = this.#tagsList
        .filter(
          tagElement => tagElement !== targetElement
            && !tagElement.classList.contains(PresetTableRow.#tagMissingClassName)
        )
        .map(tagElement => tagElement.dataset.tagName)
        .filter(tagName => typeof tagName === 'string');

      emit(this, EVENT_PRESET_TAG_CHANGE_APPLIED, {
        addedTags: new Set([tagName]),
        removedTags: new Set(tagNamesToRemove)
      });

      return;
    }

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

  updateTags(tags: Set<string>) {
    let presentTagsAmount = 0;

    for (const tagElement of this.#tagsList) {
      const isTagMissing = tagElement.classList.toggle(
        PresetTableRow.#tagMissingClassName,
        !tags.has(tagElement.dataset.tagName || ''),
      );

      if (!isTagMissing) {
        presentTagsAmount++;
      }
    }

    if (this.#preset.settings.exclusive) {
      const multipleTagsInExclusivePreset = presentTagsAmount > 1;

      this.container.classList.toggle(PresetTableRow.#presetWarningClassName, multipleTagsInExclusivePreset);

      if (multipleTagsInExclusivePreset) {
        this.#exclusiveWarning.style.removeProperty('display');
      } else {
        this.#exclusiveWarning.style.display = 'none';
      }
    }
  }

  remove() {
    this.container.remove();
  }

  static create(preset: TagEditorPreset) {
    return new this(document.createElement('tr'), preset);
  }

  static #tagMissingClassName = 'is-missing';
  static #presetWarningClassName = 'has-warning';
}
