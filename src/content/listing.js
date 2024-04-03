import {createMaintenancePopup} from "$lib/components/MaintenancePopup.js";
import {createMediaBoxTools} from "$lib/components/MediaBoxTools.js";
import {initializeMediaBox} from "$lib/components/MediaBoxWrapper.js";

document.querySelectorAll('.media-box').forEach(mediaBoxElement => {
  initializeMediaBox(mediaBoxElement, [
    createMediaBoxTools(
      createMaintenancePopup()
    )
  ]);
});
