<script>
    import Menu from "$components/ui/menu/Menu.svelte";
    import MenuItem from "$components/ui/menu/MenuItem.svelte";
    import MenuRadioItem from "$components/ui/menu/MenuRadioItem.svelte";
    import {activeProfileStore, maintenanceProfilesStore} from "$stores/maintenance-profiles-store.js";

    /** @type {import('$lib/extension/entities/MaintenanceProfile.js').default[]} */
    let profiles = [];

    $: profiles = $maintenanceProfilesStore.sort((a, b) => b.settings.name.localeCompare(a.settings.name));

    function resetActiveProfile() {
        $activeProfileStore = null;
    }

    /**
     * @param {Event} event
     */
    function enableSelectedProfile(event) {
        const target = event.target;

        if (target instanceof HTMLInputElement && target.checked) {
            activeProfileStore.set(target.value);
        }
    }
</script>

<Menu>
    <MenuItem icon="arrow-left" href="/">Back</MenuItem>
    <MenuItem icon="plus" href="/settings/maintenance/new/edit">Create New</MenuItem>
    {#if profiles.length}
        <hr>
    {/if}
    {#each profiles as profile}
        <MenuRadioItem href="/settings/maintenance/{profile.id}"
                       name="active-profile"
                       value="{profile.id}"
                       checked="{$activeProfileStore === profile.id}"
                       on:input={enableSelectedProfile}>
            {profile.settings.name}
        </MenuRadioItem>
    {/each}
    <hr>
    <MenuItem href="#" on:click={resetActiveProfile}>Reset Active Profile</MenuItem>
    <MenuItem href="/settings/maintenance/import">Import Profile</MenuItem>
</Menu>
