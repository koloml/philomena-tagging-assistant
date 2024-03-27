import "$styles/content/listing.scss";

import "$lib/web-components/MaintenancePopupComponent.js";

document.querySelectorAll('.media-box').forEach(mediaBoxElement => {
  mediaBoxElement.appendChild(
    document.createElement('maintenance-popup')
  );
});
