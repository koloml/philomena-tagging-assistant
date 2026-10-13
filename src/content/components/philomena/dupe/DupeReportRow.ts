import { BaseComponent } from "$content/components/base/BaseComponent";
import DupeDiff from "$content/components/philomena/dupe/DupeDiff";
import DupeImage from "$content/components/philomena/dupe/DupeImage";
import { ratingTags } from "$config/tags";

export default class DupeReportRow extends BaseComponent {
  #leftImage: DupeImage;
  #rightImage: DupeImage;
  #difference: DupeDiff;

  constructor(leftCell: HTMLElement, rightCell: HTMLElement, diffCell: HTMLElement, reportOptions: HTMLElement) {
    super(reportOptions);

    this.#leftImage = new DupeImage(leftCell);
    this.#rightImage = new DupeImage(rightCell);
    this.#difference = new DupeDiff(diffCell);
  }

  protected build() {
    this.#leftImage.initialize();
    this.#rightImage.initialize();
    this.#difference.initialize();
  }

  protected init() {
    this.#extractAndRenderSourcesIcons();
    this.#extractAndDisplayRatings();
  }

  #extractAndRenderSourcesIcons() {
    this.#difference.renderSources(
      this.#leftImage.imageContainer.extractSources(),
      this.#rightImage.imageContainer.extractSources(),
    );
  }

  #extractAndDisplayRatings() {
    this.#difference.renderRatings(
      DupeReportRow.#extractRating(this.#leftImage),
      DupeReportRow.#extractRating(this.#rightImage),
    );
  }

  static #extractRating(image: DupeImage): string | null {
    return image.imageContainer.extractActualTags().find(tagName => ratingTags.includes(tagName)) || null;
  }
}
