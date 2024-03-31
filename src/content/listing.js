import {createMaintenancePopup} from "$lib/components/MaintenancePopup.js";
import {createMediaBoxTools} from "$lib/components/MediaBoxToolsEvents.js";

document.querySelectorAll('.media-box').forEach(mediaBoxElement => {
  mediaBoxElement.appendChild(
    createMediaBoxTools(
      createMaintenancePopup()
    )
  );
});
