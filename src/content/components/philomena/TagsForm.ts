import { BaseComponent } from "$content/components/base/BaseComponent";
import { getComponent } from "$content/components/base/component-utils";
import { emit, on, type UnsubscribeFunction } from "$content/components/events/comms";
import { EVENT_FETCH_COMPLETE, EVENT_RELOAD, type ReloadCustomOptions } from "$content/components/events/booru-events";
import { EVENT_FORM_EDITOR_UPDATED } from "$content/components/events/tags-form-events";
import EditorPresetsBlock from "$content/components/extension/presets/EditorPresetsBlock";
import { EVENT_PRESET_TAG_CHANGE_APPLIED, type PresetTagChange } from "$content/components/events/preset-block-events";

export class TagsForm extends BaseComponent {
  #togglePresetsButton: HTMLButtonElement = document.createElement('button');
  #presetsList = EditorPresetsBlock.create();
  #plainEditorTextarea: HTMLTextAreaElement|null = null;
  #fancyEditorInput: HTMLInputElement|null = null;
  #tagsSet: Set<string> = new Set();

  protected build() {
    this.#togglePresetsButton.classList.add(
      'button',
      'button--state-primary',
      'button--bold',
      'button--separate-left',
    );

    this.#togglePresetsButton.textContent = 'Presets';

    this.container
      .querySelector(':is(.fancy-tag-edit, .fancy-tag-upload) ~ button:last-of-type')
      ?.after(this.#togglePresetsButton, this.#presetsList.container);

    this.#plainEditorTextarea = this.container.querySelector('textarea.tagsinput');
    this.#fancyEditorInput = this.container.querySelector('.js-taginput-fancy input');
  }

  protected init() {
    // Site sending the event when form is submitted vie Fetch API. We use this event to reload our logic here.
    const unsubscribe = on(
      this.container,
      EVENT_FETCH_COMPLETE,
      () => this.#waitAndDetectUpdatedForm(unsubscribe),
    );

    this.#togglePresetsButton.addEventListener('click', this.#togglePresetsList.bind(this));
    this.#presetsList.initialize();

    this.#plainEditorTextarea?.addEventListener('input', this.#refreshTagsListForPresets.bind(this));
    this.#fancyEditorInput?.addEventListener('keydown', this.#refreshTagsListForPresets.bind(this));

    this.#refreshTagsListForPresets();

    on(this.#presetsList, EVENT_PRESET_TAG_CHANGE_APPLIED, this.#onTagChangeRequested.bind(this));

    if (this.#plainEditorTextarea) {
      // When reloaded, we should catch and refresh the colors. Extension reuses this event to force site to update
      // list of tags in the fancy tag editor.
      on(this.#plainEditorTextarea, EVENT_RELOAD, this.#onPlainEditorReloadRequested.bind(this));
    }
  }

  #waitAndDetectUpdatedForm(unsubscribe: UnsubscribeFunction): void {
    const elementContainingTagEditor = this.container
      .closest('#image_tags_and_source')
      ?.parentElement;

    if (!elementContainingTagEditor) {
      return;
    }

    const observer = new MutationObserver(() => {
      const tagsFormElement = elementContainingTagEditor.querySelector<HTMLElement>('#tags-form');

      if (!tagsFormElement || getComponent(tagsFormElement)) {
        return;
      }

      const tagFormComponent = new TagsForm(tagsFormElement);
      tagFormComponent.initialize();

      const fullTagEditor = tagFormComponent.parentTagEditorElement;

      if (fullTagEditor) {
        emit(document.body, EVENT_FORM_EDITOR_UPDATED, fullTagEditor);
      } else {
        console.info('Tag form is not in the tag editor. Event is not sent.');
      }

      observer.disconnect();
      unsubscribe();
    });

    observer.observe(elementContainingTagEditor, {
      subtree: true,
      childList: true,
    });

    // Make sure to forcibly disconnect everything after a while.
    setTimeout(() => {
      observer.disconnect();
      unsubscribe();
    }, 5000);
  }

  get parentTagEditorElement(): HTMLElement | null {
    return this.container.closest<HTMLElement>('.js-tagsauce')
  }

  /**
   * Collect all the tag categories available on the page and color the tags in the editor according to them.
   */
  refreshTagColors() {
    const tagCategories = this.#gatherTagCategories();
    const editableTags = this.container.querySelectorAll<HTMLElement>('.tag');

    for (const tagElement of editableTags) {
      // Tag name is stored in the "remove" link and not in the tag itself.
      const removeLink = tagElement.querySelector('a');

      if (!removeLink) {
        continue;
      }

      const tagName = removeLink.dataset.tagName;

      if (!tagName || !tagCategories.has(tagName)) {
        continue;
      }

      const categoryName = tagCategories.get(tagName)!;

      tagElement.dataset.tagCategory = categoryName;
      tagElement.setAttribute('data-tag-category', categoryName);
    }
  }

  /**
   * Collect list of categories from the tags on the page.
   * @return
   */
  #gatherTagCategories(): Map<string, string> {
    const tagCategories: Map<string, string> = new Map();

    for (const tagElement of document.querySelectorAll<HTMLElement>('.tag[data-tag-name][data-tag-category]')) {
      const tagName = tagElement.dataset.tagName;
      const tagCategory = tagElement.dataset.tagCategory;

      if (!tagName || !tagCategory) {
        console.warn('Missing tag name or category!');
        continue;
      }

      tagCategories.set(tagName, tagCategory);
    }

    return tagCategories;
  }

  #togglePresetsList(event: Event) {
    event.stopPropagation();
    event.preventDefault();

    this.#presetsList.toggleVisibility();
    this.#refreshTagsListForPresets();
  }

  #refreshTagsListForPresets() {
    this.#tagsSet = new Set(
      this.#plainEditorTextarea?.value
        .split(',')
        .map(tagName => tagName.trim())
    );

    this.#presetsList.updateTags(this.#tagsSet);
  }

  #onTagChangeRequested(event: CustomEvent<PresetTagChange>) {
    const targetElement = event.target instanceof HTMLElement ? event.target : null;
    const { addedTags = null, removedTags = null } = event.detail;
    let tagChangeList: string[] = [];

    if (addedTags) {
      tagChangeList.push(...addedTags);
    }

    if (removedTags) {
      tagChangeList.push(
        ...Array.from(removedTags)
          .filter(tagName => this.#tagsSet.has(tagName))
          .map(tagName => `-${tagName}`)
      );
    }

    const containerOffset = this.#presetsList.container.offsetTop;
    const presetOffset = targetElement?.offsetTop || 0;

    this.#applyTagChangesWithFancyTagEditor(
      tagChangeList.join(',')
    );

    const containerOffsetDifference = this.#presetsList.container.offsetTop - containerOffset;
    const presetOffsetDifference = (targetElement?.offsetTop || 0) - presetOffset;

    // Compensating for the layout shift: when user clicks on a tag (or on "add/remove all tags"), tag editor might
    // overflow the current line and wrap tags around to the next line, causing presets section to shift. We need to
    // avoid that for better UX.
    if (containerOffsetDifference !== 0 || presetOffsetDifference !== 0) {
      window.scrollTo({
        top: window.scrollY + containerOffsetDifference + presetOffsetDifference,
        behavior: 'instant',
      });
    }
  }

  #applyTagChangesWithFancyTagEditor(tagsListWithChanges: string): void {
    if (!this.#fancyEditorInput || !this.#plainEditorTextarea) {
      return;
    }

    const originalValue = this.#fancyEditorInput.value;

    // We have to tell plain text editor to also refresh the list of tags in the fancy editor, just in case user
    // made changes to it in plain mode.
    emit(this.#plainEditorTextarea, EVENT_RELOAD, {
      // Sending that we don't need to refresh the color on this event, since we will do that ourselves later, after
      // changes are applied.
      skipTagColorRefresh: true,
      skipTagRefresh: true,
    });

    this.#fancyEditorInput.value = tagsListWithChanges;
    this.#fancyEditorInput.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Comma',
    }));

    this.#fancyEditorInput.value = originalValue;

    this.refreshTagColors();
  }

  #onPlainEditorReloadRequested(event: CustomEvent<ReloadCustomOptions|null>) {
    if (!event.detail?.skipTagColorRefresh) {
      this.refreshTagColors();
    }

    if (!event.detail?.skipTagRefresh) {
      this.#refreshTagsListForPresets();
    }
  }

  static watchForEditors() {
    document.body.addEventListener('click', event => {
      const targetElement = event.target;

      if (!(targetElement instanceof HTMLElement)) {
        return;
      }

      const tagEditorWrapper = targetElement.closest('#image_tags_and_source');

      if (!tagEditorWrapper) {
        return;
      }

      const refreshTrigger = targetElement.closest<HTMLElement>('.js-taginput-show, #edit-tags')

      if (!refreshTrigger) {
        return;
      }

      const tagFormElement = tagEditorWrapper.querySelector<HTMLElement>('#tags-form');

      if (!tagFormElement) {
        return;
      }

      let tagEditor = getComponent(tagFormElement);

      if (!tagEditor || !(tagEditor instanceof TagsForm)) {
        tagEditor = new TagsForm(tagFormElement);
        tagEditor.initialize();
      }

      (tagEditor as TagsForm).refreshTagColors();
    });
  }

  static initializeUploadEditor() {
    const uploadEditorContainer = document.querySelector<HTMLElement>('.field:has(.fancy-tag-upload)');

    if (!uploadEditorContainer) {
      return;
    }

    new TagsForm(uploadEditorContainer).initialize();
  }
}
