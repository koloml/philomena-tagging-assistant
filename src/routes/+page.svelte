<script>
    import Menu from "$components/ui/menu/Menu.svelte";
    import MenuItem from "$components/ui/menu/MenuItem.svelte";
    import { activeProfileStore, maintenanceProfilesStore } from "$stores/maintenance-profiles-store";
    import MenuCheckboxItem from "$components/ui/menu/MenuCheckboxItem.svelte";

    /** @type {import('$entities/MaintenanceProfile').default|undefined} */
    let activeProfile;

    $: activeProfile = $maintenanceProfilesStore.find(profile => profile.id === $activeProfileStore);

    function turnOffActiveProfile() {
        $activeProfileStore = null;
    }
</script>

<Menu>
    {#if activeProfile}
        <MenuCheckboxItem checked on:input={turnOffActiveProfile} href="/features/maintenance/{activeProfile.id}">
            Active Profile: {activeProfile.settings.name}
        </MenuCheckboxItem>
        <hr>
    {/if}
    <MenuItem href="/features/maintenance">Tagging Profiles</MenuItem>
    <MenuItem href="/features/groups">Tag Groups</MenuItem>
    <hr>
    <MenuItem href="/preferences">Preferences</MenuItem>
    <MenuItem href="/about">About</MenuItem>
</Menu>
