import {createMaintenancePopup} from "$lib/components/MaintenancePopup.js";
import {createMediaBoxTools} from "$lib/components/MediaBoxToolsEvents.js";
import {initializeMediaBox} from "$lib/components/MediaBoxWrapper.js";

document.querySelectorAll('.media-box').forEach(mediaBoxElement => {
  initializeMediaBox(mediaBoxElement, [
    createMediaBoxTools(
      createMaintenancePopup()
    )
  ]);
});
