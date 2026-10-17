import { BaseComponent } from "$content/components/base/BaseComponent";
import TaggingProfile from "$entities/TaggingProfile";
import TaggingProfilesPreferences from "$lib/extension/preferences/TaggingProfilesPreferences";
import { getComponent } from "$content/components/base/component-utils";
import CustomCategoriesResolver from "$lib/extension/CustomCategoriesResolver";
import { on } from "$content/components/events/comms";
import { EVENT_FORM_EDITOR_UPDATED } from "$content/components/events/tags-form-events";
import { EVENT_TAG_GROUP_RESOLVED } from "$content/components/events/tag-dropdown-events";
import type TagGroup from "$entities/TagGroup";

export class TagDropdown extends BaseComponent {
  /**
   * Container with dropdown elements to insert options into.
   */
  #dropdownContainer: HTMLElement | null = null;

  /**
   * Button to add or remove the current tag into/from the active profile.
   */
  #toggleOnExistingButton: HTMLAnchorElement | null = null;

  /**
   * Button to create a new profile, make it active and add the current tag into the active profile.
   */
  #addToNewButton: HTMLAnchorElement | null = null;

  /**
   * Local clone of the currently active profile used for updating the list of tags.
   */
  #activeProfile: TaggingProfile | null = null;

  /**
   * Is cursor currently entered the dropdown.
   */
  #isEntered: boolean = false;

  #originalCategory: string | undefined | null = null;

  build() {
    this.#dropdownContainer = this.container.querySelector('.dropdown__content');
  }

  init() {
    this.on('mouseenter', this.#onDropdownEntered.bind(this));
    this.on('mouseleave', this.#onDropdownLeft.bind(this));

    TagDropdown.#watchActiveProfile(activeProfileOrNull => {
      this.#activeProfile = activeProfileOrNull;

      if (this.#isEntered) {
        this.#updateButtons();
      }
    });

    on(this, EVENT_TAG_GROUP_RESOLVED, this.#onTagGroupResolved.bind(this));
  }

  #onTagGroupResolved(resolvedGroupEvent: CustomEvent<TagGroup | null>) {
    if (this.originalCategory) {
      return;
    }

    const maybeTagGroup = resolvedGroupEvent.detail;

    if (!maybeTagGroup) {
      this.tagCategory = this.originalCategory;
      return;
    }

    this.tagCategory = maybeTagGroup.settings.category;
  }

  get tagName() {
    return this.container.dataset.tagName;
  }

  /**
   * @return {string|undefined}
   */
  get tagCategory() {
    return this.container.dataset.tagCategory;
  }

  /**
   * @param {string|undefined} targetCategory
   */
  set tagCategory(targetCategory) {
    // Make sure original category is properly stored.
    this.originalCategory;

    if (targetCategory) {
      this.container.dataset.tagCategory = targetCategory;
      return;
    }

    delete this.container.dataset.tagCategory;
  }

  /**
   * @return {string|undefined}
   */
  get originalCategory() {
    if (this.#originalCategory === null) {
      this.#originalCategory = this.tagCategory;
    }

    return this.#originalCategory;
  }

  #onDropdownEntered() {
    this.#isEntered = true;
    this.#updateButtons();
  }

  #onDropdownLeft() {
    this.#isEntered = false;
  }

  #updateButtons() {
    if (!this.#activeProfile) {
      this.#addToNewButton ??= TagDropdown.#createDropdownLink(
        'Add to new tagging profile',
        this.#onAddToNewClicked.bind(this)
      );

      if (!this.#addToNewButton.isConnected) {
        this.#dropdownContainer?.append(this.#addToNewButton);
      }
    } else {
      this.#addToNewButton?.remove();
    }

    if (this.#activeProfile) {
      this.#toggleOnExistingButton ??= TagDropdown.#createDropdownLink(
        'Add to existing tagging profile',
        this.#onToggleInExistingClicked.bind(this)
      );

      const profileName = this.#activeProfile.settings.name;
      let profileSpecificButtonText = `Add to profile "${profileName}"`;
      const tagName = this.tagName;

      if (tagName && this.#activeProfile.settings.tags.includes(tagName)) {
        profileSpecificButtonText = `Remove from profile "${profileName}"`;
      }

      if (this.#toggleOnExistingButton.lastChild instanceof Text) {
        this.#toggleOnExistingButton.lastChild.textContent = ` ${profileSpecificButtonText}`;
      } else {
        // Just in case last child is missing, then update the text on the full element.
        this.#toggleOnExistingButton.textContent = profileSpecificButtonText;
      }

      if (!this.#toggleOnExistingButton.isConnected) {
        this.#dropdownContainer?.append(this.#toggleOnExistingButton);
      }

      return;
    }

    this.#toggleOnExistingButton?.remove();
  }

  async #onAddToNewClicked() {
    const tagName = this.tagName;

    if (!tagName) {
      throw new Error('Missing tag name to create the profile!');
    }

    const profile = new TaggingProfile(crypto.randomUUID(), {
      name: 'Temporary Profile (' + (new Date().toISOString()) + ')',
      tags: [this.tagName],
      temporary: true,
    });

    await profile.save();
    await TagDropdown.#preferences.activeProfile.set(profile.id);
  }

  async #onToggleInExistingClicked() {
    if (!this.#activeProfile) {
      return;
    }

    const tagsList = new Set(this.#activeProfile.settings.tags);
    const targetTagName = this.tagName;

    if (!targetTagName) {
      throw new Error('Missing tag name!');
    }

    if (tagsList.has(targetTagName)) {
      tagsList.delete(targetTagName);
    } else {
      tagsList.add(targetTagName);
    }

    this.#activeProfile.settings.tags = Array.from(tagsList.values());

    await this.#activeProfile.save();
  }

  static #preferences = new TaggingProfilesPreferences();

  /**
   * Watch for changes to active profile.
   * @param onActiveProfileChange Callback to call when profile was
   * changed.
   */
  static #watchActiveProfile(onActiveProfileChange: (profile: TaggingProfile | null) => void) {
    let lastActiveProfile: string | null = null;

    this.#preferences.subscribe((settings) => {
      lastActiveProfile = settings.activeProfile ?? null;

      this.#preferences
        .activeProfile.asObject()
        .then(onActiveProfileChange);
    });

    TaggingProfile.subscribe(profiles => {
      const activeProfile = profiles
        .find(profile => profile.id === lastActiveProfile);

      onActiveProfileChange(activeProfile ?? null
      );
    });

    this.#preferences
      .activeProfile.asObject()
      .then(activeProfile => {
        lastActiveProfile = activeProfile?.id ?? null;
        onActiveProfileChange(activeProfile);
      });
  }

  /**
   * Create element for dropdown.
   * @param text Base text for the option.
   * @param onClickHandler Click handler. Event will be prevented by default.
   * @return
   */
  static #createDropdownLink(text: string, onClickHandler: (event: MouseEvent) => void): HTMLAnchorElement {
    const dropdownLink = document.createElement('a');
    dropdownLink.href = '#';
    dropdownLink.className = 'tag__dropdown__link';

    const dropdownLinkIcon = document.createElement('i');
    dropdownLinkIcon.classList.add('fa', 'fa-tags');

    dropdownLink.textContent = ` ${text}`;
    dropdownLink.insertAdjacentElement('afterbegin', dropdownLinkIcon);

    dropdownLink.addEventListener('click', event => {
      event.preventDefault();
      onClickHandler(event);
    });

    return dropdownLink;
  }

  static #categoriesResolver = new CustomCategoriesResolver();
  static #processedElements: WeakSet<HTMLElement> = new WeakSet();

  static #findAll(parentNode: ParentNode = document): NodeListOf<HTMLElement> {
    return parentNode.querySelectorAll('.tag.dropdown');
  }

  static #initialize(element: HTMLElement) {
    // Skip initialization when tag component is already wrapped
    if (getComponent(element)) {
      return;
    }

    const tagDropdown = new TagDropdown(element);
    tagDropdown.initialize();

    this.#categoriesResolver.addElement(tagDropdown);
  }

  static findAllAndInitialize(parentNode: ParentNode = document) {
    for (const element of this.#findAll(parentNode)) {
      this.#initialize(element);
    }
  }

  static watch() {
    // We only need to watch for new editor elements if there is a tag editor present on the page
    if (!document.querySelector('#image_tags_and_source')) {
      return;
    }

    document.body.addEventListener('mouseover', event => {
      const targetElement = event.target;

      if (!(targetElement instanceof HTMLElement)) {
        return;
      }

      if (this.#processedElements.has(targetElement)) {
        return;
      }

      const closestTagEditor = targetElement.closest<HTMLElement>('#image_tags_and_source');

      if (!closestTagEditor || this.#processedElements.has(closestTagEditor)) {
        this.#processedElements.add(targetElement);
        return;
      }

      this.#processedElements.add(targetElement);
      this.#processedElements.add(closestTagEditor);

      this.findAllAndInitialize(closestTagEditor);
    });

    // When form is submitted, its DOM is completely updated. We need to fetch those tags in this case.
    on(document.body, EVENT_FORM_EDITOR_UPDATED, event => {
      this.findAllAndInitialize(event.detail);
    });
  }
}
