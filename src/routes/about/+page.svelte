<script>
  import Menu from "$components/ui/menu/Menu.svelte";
  import MenuItem from "$components/ui/menu/MenuItem.svelte";
  import { PLUGIN_NAME } from "$lib/constants";
  import { popupTitle } from "$stores/popup";

  $popupTitle = 'About';

  let currentSiteUrl = 'https://furbooru.org';

  if (__CURRENT_SITE__ === 'derpibooru') {
    currentSiteUrl = 'https://derpibooru.org';
  }

  if (__CURRENT_SITE__ === 'tantabus') {
    currentSiteUrl = 'https://tantabus.ai';
  }
</script>

<Menu>
  <MenuItem href="/" icon="arrow-left">Back</MenuItem>
  <hr>
</Menu>
<h1>
  {PLUGIN_NAME}
</h1>
<p>
  This is a small tool to make tagging on {__CURRENT_SITE_NAME__} just a little bit more convenient. Group tags with
  your own rules; add or remove tags from the images without opening them up; preview images and videos on click and
  a little bit more. This extension is highly unstable and might break at any point, so be aware.
</p>
<Menu>
  <hr>
  <MenuItem href={currentSiteUrl} icon="globe" target="_blank">
    Visit {__CURRENT_SITE_NAME__}
  </MenuItem>
  <MenuItem href="https://github.com/koloml/philomena-tagging-assistant" icon="info-circle" target="_blank">
    GitHub Repo
  </MenuItem>
</Menu>

<style>
  h1, p {
    margin-top: .5em;
    margin-bottom: .5em;
  }
</style>
