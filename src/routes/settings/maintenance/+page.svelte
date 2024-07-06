<script>
    import Menu from "$components/ui/menu/Menu.svelte";
    import MenuItem from "$components/ui/menu/MenuItem.svelte";
    import {activeProfileStore, maintenanceProfilesStore} from "$stores/maintenance-profiles-store.js";

    /** @type {import('$lib/extension/entities/MaintenanceProfile.js').default[]} */
    let profiles = [];

    $: profiles = $maintenanceProfilesStore.sort((a, b) => b.settings.name.localeCompare(a.settings.name));

    function resetActiveProfile() {
        $activeProfileStore = null;
    }
</script>

<Menu>
    <MenuItem icon="arrow-left" href="/">Back</MenuItem>
    <MenuItem icon="plus" href="/settings/maintenance/new/edit">Create New</MenuItem>
    {#if profiles.length}
        <hr>
    {/if}
    {#each profiles as profile}
        <MenuItem href="/settings/maintenance/{profile.id}"
                  icon="{$activeProfileStore === profile.id ? 'tag' : null}">
            {profile.settings.name}
        </MenuItem>
    {/each}
    <hr>
    <MenuItem href="#" on:click={resetActiveProfile}>Reset Active Profile</MenuItem>
</Menu>
