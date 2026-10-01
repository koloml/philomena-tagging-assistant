import { BaseComponent } from "$content/components/base/BaseComponent";
import DupeReportRow from "$content/components/philomena/dupe/DupeReportRow";

export default class GridDupeReportsList extends BaseComponent {
  readonly #reports: DupeReportRow[] = [];

  protected build() {
    const repotRowsList = this.container.querySelectorAll('tbody > tr');

    for (const reportRow of repotRowsList) {
      const startingCell = reportRow.firstElementChild;
      const rightImageCell = startingCell?.nextElementSibling || null;
      const diffCell = rightImageCell?.nextElementSibling || null;
      const reportOptionsCell = diffCell?.nextElementSibling || null;

      if (!(startingCell instanceof HTMLElement) || !(rightImageCell instanceof HTMLElement) || !(diffCell instanceof HTMLElement) || !(reportOptionsCell instanceof HTMLElement)) {
        console.error(`Unable to capture duplicate report!`, reportRow);
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
    for (const container of document.querySelectorAll<HTMLElement>('.dupe-report-list')) {
      new GridDupeReportsList(container).initialize();
    }
  }
}
