<script>
    import Menu from "$components/ui/menu/Menu.svelte";
    import MenuItem from "$components/ui/menu/MenuItem.svelte";
    import {page} from "$app/stores";
    import {goto} from "$app/navigation";
    import {activeProfileStore, maintenanceProfilesStore} from "$stores/maintenance-profiles-store.js";
    import ProfileView from "$components/maintenance/ProfileView.svelte";

    const profileId = $page.params.id;
    /** @type {import('$lib/extension/entities/MaintenanceProfile.js').default|null} */
    let profile = null;
    let isActiveProfile = false;

    if (profileId === 'new') {
        goto('/maintenance/profiles/new/edit');
    }

    $: {
        const resolvedProfile = $maintenanceProfilesStore.find(profile => profile.id === profileId);

        if (resolvedProfile) {
            profile = resolvedProfile;
        } else {
            console.warn(`Profile ${profileId} not found.`);
            goto('/settings/maintenance');
        }
    }

    $: isActiveProfile = $activeProfileStore === profileId;

    function activateProfile() {
        if (isActiveProfile) {
            return;
        }

        $activeProfileStore = profileId;
    }
</script>

<Menu>
    <MenuItem href="/settings/maintenance" icon="arrow-left">Back</MenuItem>
    <hr>
</Menu>
{#if profile}
    <ProfileView {profile}/>
{/if}
<Menu>
    <hr>
    <MenuItem icon="wrench" href="/settings/maintenance/{profileId}/edit">Edit Profile</MenuItem>
    <MenuItem icon="tag" href="#" on:click={activateProfile}>
        {#if isActiveProfile}
            <span>Profile is Active</span>
        {:else}
            <span>Activate Profile</span>
        {/if}
    </MenuItem>
    <MenuItem icon="file-export" href="/settings/maintenance/{profileId}/export">
        Export Profile
    </MenuItem>
</Menu>

<style lang="scss">
</style>
