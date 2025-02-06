import { createMaintenancePopup } from "$lib/components/MaintenancePopup";
import { createMediaBoxTools } from "$lib/components/MediaBoxTools";
import { calculateMediaBoxesPositions, initializeMediaBox } from "$lib/components/MediaBoxWrapper";
import { createMaintenanceStatusIcon } from "$lib/components/MaintenanceStatusIcon";
import { createImageShowFullscreenButton } from "$lib/components/ImageShowFullscreenButton";

/** @type {NodeListOf<HTMLElement>} */
const mediaBoxes = document.querySelectorAll('.media-box');

mediaBoxes.forEach(mediaBoxElement => {
  initializeMediaBox(mediaBoxElement, [
    createMediaBoxTools(
      createMaintenancePopup(),
      createMaintenanceStatusIcon(),
      createImageShowFullscreenButton(),
    )
  ]);

  // Attempt to fix misplacement of media boxes
  requestAnimationFrame(() => {
    window.dispatchEvent(new CustomEvent('resize'));
  })
});

calculateMediaBoxesPositions(mediaBoxes);
