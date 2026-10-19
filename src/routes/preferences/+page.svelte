<script>
  import Menu from "$components/ui/menu/Menu.svelte";
  import MenuItem from "$components/ui/menu/MenuItem.svelte";
  import { popupTitle } from "$stores/popup";

  $popupTitle = 'Preferences';
</script>

<Menu>
  <MenuItem href="/" icon="arrow-left">Back</MenuItem>
  <hr>
  <MenuItem href="/preferences/tags">Tagging</MenuItem>
  <MenuItem href="/preferences/misc">Misc & Tools</MenuItem>
  <MenuItem href="/preferences/fun">Fun</MenuItem>
  <hr>
  <MenuItem href="/preferences/debug">Debug</MenuItem>
</Menu>
