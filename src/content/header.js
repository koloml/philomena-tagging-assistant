import {initializeSiteHeader} from "$lib/components/SiteHeaderWrapper.js";

const siteHeader = document.querySelector('.header');

if (siteHeader) {
  initializeSiteHeader(siteHeader);
}
