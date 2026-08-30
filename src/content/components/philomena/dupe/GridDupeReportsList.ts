import { BaseComponent } from "$content/components/base/BaseComponent";
import DupeReportRow from "$content/components/philomena/dupe/DupeReportRow";

export default class GridDupeReportsList extends BaseComponent {
  readonly #reports: DupeReportRow[] = [];

  protected build() {
    const childrenElements = this.container.children;

    for (let cellIndex = 0; cellIndex < this.container.childElementCount; cellIndex += 4) {
      const startingCell = childrenElements.item(cellIndex);

      // First 4 cells are actually table headers, skipping them.
      if (!(startingCell instanceof HTMLElement) || startingCell.tagName === 'P') {
        continue;
      }

      const rightImageCell = startingCell.nextElementSibling;
      const diffCell = rightImageCell?.nextElementSibling || null;
      const reportOptionsCell = diffCell?.nextElementSibling || null;

      if (!(rightImageCell instanceof HTMLElement) || !(diffCell instanceof HTMLElement) || !(reportOptionsCell instanceof HTMLElement)) {
        console.error(`Unable to capture duplicate report row from starting cell at index ${cellIndex}!`);
        continue;
      }

      this.#reports.push(
        new DupeReportRow(
          startingCell,
          rightImageCell,
          diffCell,
          reportOptionsCell,
        )
      );
    }
  }

  protected init() {
    for (const report of this.#reports) {
      report.initialize();
    }
  }

  static findAndInitialize() {
    for (const container of document.querySelectorAll<HTMLElement>('.grid--dupe-report-list')) {
      new GridDupeReportsList(container).initialize();
    }
  }
}
