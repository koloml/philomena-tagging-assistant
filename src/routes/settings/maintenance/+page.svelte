<script>
    import Menu from "$components/ui/menu/Menu.svelte";
    import MenuLink from "$components/ui/menu/MenuLink.svelte";
    import {activeProfileStore, maintenanceProfilesStore} from "$stores/maintenance-profiles-store.js";

    /** @type {import('$lib/extension/entities/MaintenanceProfile.js').default[]} */
    let profiles = [];

    $: profiles = $maintenanceProfilesStore.sort((a, b) => b.settings.name.localeCompare(a.settings.name));

    function resetActiveProfile() {
        $activeProfileStore = null;
    }
</script>

<Menu>
    <MenuLink icon="arrow-left" href="/">Back</MenuLink>
    <MenuLink icon="plus" href="/settings/maintenance/new/edit">Create New</MenuLink>
    {#if profiles.length}
        <hr>
    {/if}
    {#each profiles as profile}
        <MenuLink href="/settings/maintenance/{profile.id}"
                  icon="{$activeProfileStore === profile.id ? 'tag' : null}">
            {profile.settings.name}
        </MenuLink>
    {/each}
    <hr>
    <MenuLink href="#" on:click={resetActiveProfile}>Reset Active Profile</MenuLink>
</Menu>
