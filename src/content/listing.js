import {createMaintenancePopup} from "$lib/components/MaintenancePopup.js";
import {createMaintenanceTools} from "$lib/components/MaintenanceTools.js";

document.querySelectorAll('.media-box').forEach(mediaBoxElement => {
  mediaBoxElement.appendChild(
    createMaintenanceTools(
      createMaintenancePopup()
    )
  );
});
