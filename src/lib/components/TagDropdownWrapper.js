import { BaseComponent } from "$lib/components/base/BaseComponent";
import MaintenanceProfile from "$entities/MaintenanceProfile";
import MaintenanceSettings from "$lib/extension/settings/MaintenanceSettings";
import { getComponent } from "$lib/components/base/component-utils";
import CustomCategoriesResolver from "$lib/extension/CustomCategoriesResolver";

const isTagEditorProcessedKey = Symbol();
const categoriesResolver = new CustomCategoriesResolver();

export class TagDropdownWrapper extends BaseComponent {
  /**
   * Container with dropdown elements to insert options into.
   * @type {HTMLElement}
   */
  #dropdownContainer;

  /**
   * Button to add or remove the current tag into/from the active profile.
   * @type {HTMLAnchorElement|null}
   */
  #toggleOnExistingButton = null;

  /**
   * Button to create a new profile, make it active and add the current tag into the active profile.
   * @type {HTMLAnchorElement|null}
   */
  #addToNewButton = null;

  /**
   * Local clone of the currently active profile used for updating the list of tags.
   * @type {MaintenanceProfile|null}
   */
  #activeProfile = null;

  /**
   * Is cursor currently entered the dropdown.
   * @type {boolean}
   */
  #isEntered = false;

  /**
   * @type {string|undefined|null}
   */
  #originalCategory = null;

  build() {
    this.#dropdownContainer = this.container.querySelector('.dropdown__content');
  }

  init() {
    this.on('mouseenter', this.#onDropdownEntered.bind(this));
    this.on('mouseleave', this.#onDropdownLeft.bind(this));

    TagDropdownWrapper.#watchActiveProfile(activeProfileOrNull => {
      this.#activeProfile = activeProfileOrNull;

      if (this.#isEntered) {
        this.#updateButtons();
      }
    });
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

    this.container.dataset.tagCategory = targetCategory;

    if (targetCategory) {
      this.container.setAttribute('data-tag-category', targetCategory);
      return;
    }

    this.container.removeAttribute('data-tag-category');
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
      this.#addToNewButton ??= TagDropdownWrapper.#createDropdownLink(
        'Add to new tagging profile',
        this.#onAddToNewClicked.bind(this)
      );

      if (!this.#addToNewButton.isConnected) {
        this.#dropdownContainer.append(this.#addToNewButton);
      }
    } else {
      this.#addToNewButton?.remove();
    }

    if (this.#activeProfile) {
      this.#toggleOnExistingButton ??= TagDropdownWrapper.#createDropdownLink(
        'Add to existing tagging profile',
        this.#onToggleInExistingClicked.bind(this)
      );

      const profileName = this.#activeProfile.settings.name;
      let profileSpecificButtonText = `Add to profile "${profileName}"`;

      if (this.#activeProfile.settings.tags.includes(this.tagName)) {
        profileSpecificButtonText = `Remove from profile "${profileName}"`;
      }

      this.#toggleOnExistingButton.innerText = profileSpecificButtonText;

      if (!this.#toggleOnExistingButton.isConnected) {
        this.#dropdownContainer.append(this.#toggleOnExistingButton);
      }

      return;
    }

    this.#toggleOnExistingButton?.remove();
  }

  async #onAddToNewClicked() {
    const profile = new MaintenanceProfile(crypto.randomUUID(), {
      name: 'Temporary Profile (' + (new Date().toISOString()) + ')',
      tags: [this.tagName],
      temporary: true,
    });

    await profile.save();
    await TagDropdownWrapper.#maintenanceSettings.setActiveProfileId(profile.id);
  }

  async #onToggleInExistingClicked() {
    if (!this.#activeProfile) {
      return;
    }

    const tagsList = new Set(this.#activeProfile.settings.tags);
    const targetTagName = this.tagName;

    if (tagsList.has(targetTagName)) {
      tagsList.delete(targetTagName);
    } else {
      tagsList.add(targetTagName);
    }

    this.#activeProfile.settings.tags = Array.from(tagsList.values());

    await this.#activeProfile.save();
  }

  static #maintenanceSettings = new MaintenanceSettings();

  /**
   * Watch for changes to active profile.
   * @param {(profile: MaintenanceProfile|null) => void} onActiveProfileChange Callback to call when profile was
   * changed.
   */
  static #watchActiveProfile(onActiveProfileChange) {
    let lastActiveProfile;

    this.#maintenanceSettings.subscribe((settings) => {
      lastActiveProfile = settings.activeProfile;

      this.#maintenanceSettings
        .resolveActiveProfileAsObject()
        .then(onActiveProfileChange);
    });

    MaintenanceProfile.subscribe(profiles => {
      const activeProfile = profiles
        .find(profile => profile.id === lastActiveProfile);

      onActiveProfileChange(activeProfile);
    });

    this.#maintenanceSettings
      .resolveActiveProfileAsObject()
      .then(activeProfile => {
        lastActiveProfile = activeProfile?.id ?? null;
        onActiveProfileChange(activeProfile);
      });
  }

  /**
   * Create element for dropdown.
   * @param {string} text Base text for the option.
   * @param {(event: MouseEvent) => void} onClickHandler Click handler. Event will be prevented by default.
   * @return {HTMLAnchorElement}
   */
  static #createDropdownLink(text, onClickHandler) {
    /** @type {HTMLAnchorElement} */
    const dropdownLink = document.createElement('a');
    dropdownLink.href = '#';
    dropdownLink.innerText = text;
    dropdownLink.className = 'tag__dropdown__link';

    dropdownLink.addEventListener('click', event => {
      event.preventDefault();
      onClickHandler(event);
    });

    return dropdownLink;
  }
}

export function wrapTagDropdown(element) {
  // Skip initialization when tag component is already wrapped
  if (getComponent(element)) {
    return;
  }

  const tagDropdown = new TagDropdownWrapper(element);
  tagDropdown.initialize();

  categoriesResolver.addElement(tagDropdown);
}

export function watchTagDropdownsInTagsEditor() {
  // We only need to watch for new editor elements if there is a tag editor present on the page
  if (!document.querySelector('#image_tags_and_source')) {
    return;
  }

  document.body.addEventListener('mouseover', event => {
    /** @type {HTMLElement} */
    const targetElement = event.target;

    if (targetElement[isTagEditorProcessedKey]) {
      return;
    }

    /** @type {HTMLElement|null} */
    const closestTagEditor = targetElement.closest('#image_tags_and_source');

    if (!closestTagEditor || closestTagEditor[isTagEditorProcessedKey]) {
      targetElement[isTagEditorProcessedKey] = true;
      return;
    }

    targetElement[isTagEditorProcessedKey] = true;
    closestTagEditor[isTagEditorProcessedKey] = true;

    for (const tagDropdownElement of closestTagEditor.querySelectorAll('.tag.dropdown')) {
      wrapTagDropdown(tagDropdownElement);
    }
  })
}
