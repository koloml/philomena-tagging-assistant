import { BaseComponent } from "$content/components/base/BaseComponent";
import TagEditorPreset from "$entities/TagEditorPreset";
import PresetTableRow from "$content/components/extension/presets/PresetTableRow";
import { createFontAwesomeIcon } from "$lib/dom-utils";
import { sortEntitiesByField } from "$lib/utils";

export default class EditorPresetsBlock extends BaseComponent {
  readonly #presetsTable = document.createElement('table');
  readonly #presetBlocks: PresetTableRow[] = [];
  #tags: Set<string> = new Set();

  protected build() {
    this.container.classList.add('block', 'hidden', 'tag-presets');
    this.container.style.marginTop = 'var(--block-spacing)';

    const header = document.createElement('div');
    header.classList.add('block__header');

    const headerTitle = document.createElement('div');
    headerTitle.classList.add('block__header__title')
    headerTitle.textContent = ' Presets';

    const content = document.createElement('div');
    content.classList.add('block__content');

    this.#presetsTable.append(
      document.createElement('thead'),
      document.createElement('tbody'),
    );

    this.#presetsTable.tHead?.append(
      EditorPresetsBlock.#createRowWithTableHeads([
        'Name',
        'Tags',
        'Actions'
      ]),
    );

    headerTitle.prepend(createFontAwesomeIcon('layer-group'));
    header.append(headerTitle);
    content.append(this.#presetsTable);

    this.container.append(
      header,
      content,
    );
  }

  protected init() {
    TagEditorPreset.readAll()
      .then(this.#refreshPresets.bind(this))
      .then(() => TagEditorPreset.subscribe(this.#refreshPresets.bind(this)));
  }

  toggleVisibility(shouldBeVisible: boolean | undefined = undefined) {
    this.container.classList.toggle('hidden', shouldBeVisible);
  }

  updateTags(tags: Set<string>) {
    this.#tags = tags;

    for (const presetBlock of this.#presetBlocks) {
      presetBlock.updateTags(tags);
    }
  }

  #refreshPresets(presetsList: TagEditorPreset[]) {
    if (this.#presetBlocks.length) {
      for (const block of this.#presetBlocks) {
        block.remove();
      }
    }

    for (const preset of sortEntitiesByField(presetsList, "name")) {
      const block = PresetTableRow.create(preset);
      this.#presetsTable.tBodies[0]?.append(block.container);
      block.initialize();
      block.updateTags(this.#tags);

      this.#presetBlocks.push(block);
    }
  }

  static create(): EditorPresetsBlock {
    return new EditorPresetsBlock(
      document.createElement('div')
    );
  }

  static #createRowWithTableHeads(columnNames: string[]): HTMLTableRowElement {
    const rowElement = document.createElement('tr');

    for (const columnName of columnNames) {
      const columnHeadElement = document.createElement('th');
      columnHeadElement.textContent = columnName;

      rowElement.append(columnHeadElement);
    }

    return rowElement;
  }
}
