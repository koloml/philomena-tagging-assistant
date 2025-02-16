<script>
    import { goto } from "$app/navigation";
    import Menu from "$components/ui/menu/Menu.svelte";
    import MenuItem from "$components/ui/menu/MenuItem.svelte";
    import { page } from "$app/stores";
    import { maintenanceProfiles } from "$stores/entities/maintenance-profiles";

    const profileId = $page.params.id;
    const targetProfile = $maintenanceProfiles.find(profile => profile.id === profileId);

    if (!targetProfile) {
        void goto('/features/maintenance');
    }

    async function deleteProfile() {
        if (!targetProfile) {
            console.warn('Attempting to delete the profile, but the profile is not loaded yet.');
            return;
        }

        await targetProfile.delete();
        await goto('/features/maintenance');
    }
</script>

<Menu>
    <MenuItem icon="arrow-left" href="/features/maintenance/{profileId}">Back</MenuItem>
    <hr>
</Menu>
{#if targetProfile}
    <p>
        Do you want to remove profile "{targetProfile.settings.name}"? This action is irreversible.
    </p>
    <Menu>
        <hr>
        <MenuItem on:click={deleteProfile}>Yes</MenuItem>
        <MenuItem href="/features/maintenance/{profileId}">No</MenuItem>
    </Menu>
{:else}
    <p>Loading...</p>
{/if}
