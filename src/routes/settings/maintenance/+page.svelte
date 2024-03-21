<script>
  import Menu from "$components/ui/menu/Menu.svelte";
  import MenuLink from "$components/ui/menu/MenuLink.svelte";
  import {maintenanceProfilesStore} from "$stores/maintenance-profiles-store.js";
  import {onDestroy} from "svelte";

  /** @type {import('$lib/extension/entities/MaintenanceProfile.js').default[]} */
  let profiles = [];

  const unsubscribeFromProfiles = maintenanceProfilesStore.subscribe(updatedProfiles => {
    profiles = updatedProfiles.sort(
      (a, b) => b.settings.name.localeCompare(a.settings.name)
	);
  });

  onDestroy(unsubscribeFromProfiles);
</script>

<Menu>
	<MenuLink icon="arrow-left" href="/">Back</MenuLink>
	<MenuLink icon="plus" href="/settings/maintenance/new/edit">Create New</MenuLink>
	{#if profiles.length}
		<hr>
	{/if}
	{#each profiles as profile}
		<MenuLink href="/settings/maintenance/{profile.id}">{profile.settings.name}</MenuLink>
	{/each}
</Menu>