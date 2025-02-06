import { initializeSiteHeader } from "$lib/components/SiteHeaderWrapper";

const siteHeader = document.querySelector('.header');

if (siteHeader) {
  initializeSiteHeader(siteHeader);
}
