import { TaggingProfilePopup } from "$content/components/extension/profiles/TaggingProfilePopup";
import { MediaBoxTools } from "$content/components/extension/MediaBoxTools";
import { MediaBox } from "$content/components/philomena/MediaBox";
import { TaggingProfileStatusIcon } from "$content/components/extension/profiles/TaggingProfileStatusIcon";
import { ImageShowFullscreenButton } from "$content/components/extension/ImageShowFullscreenButton";
import { ImageListContainer } from "$content/components/philomena/listing/ImageListContainer";

const mediaBoxes = MediaBox.findElements();

mediaBoxes.forEach(mediaBoxElement => {
  MediaBox.initialize(mediaBoxElement, MediaBoxTools.create(
    TaggingProfilePopup.create(),
    TaggingProfileStatusIcon.create(),
    ImageShowFullscreenButton.create(),
  ));

  // Attempt to fix misplacement of media boxes
  requestAnimationFrame(() => {
    window.dispatchEvent(new CustomEvent('resize'));
  })
});

MediaBox.initializePositionCalculation(mediaBoxes);
ImageListContainer.findAndInitialize();
