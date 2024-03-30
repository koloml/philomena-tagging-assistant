import {createMaintenancePopup} from "$lib/components/MaintenancePopup.js";

document.querySelectorAll('.media-box').forEach(mediaBoxElement => {
  mediaBoxElement.appendChild(createMaintenancePopup());
});
