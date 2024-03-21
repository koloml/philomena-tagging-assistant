<script>
  import Menu from "$components/ui/menu/Menu.svelte";
  import MenuLink from "$components/ui/menu/MenuLink.svelte";
</script>

<Menu>
	<MenuLink icon="arrow-left" href="/">Back</MenuLink>
	<hr>
</Menu>
<h1>
	Furbooru Tagging Assistant
</h1>
<p>
	This is a tool made to help tag images on Furbooru more efficiently. It is currently in development and is not yet
	ready for use, but it still can provide some useful functionality.
</p>
<Menu>
	<hr>
	<MenuLink icon="globe" href="https://furbooru.org" target="_blank">
		Visit Furbooru
	</MenuLink>
	<MenuLink icon="info-circle" href="https://github.com/koloml/furbooru-tagging-assistant" target="_blank">
		GitHub Repo
	</MenuLink>
</Menu>