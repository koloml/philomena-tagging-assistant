<script>
    import Menu from "$components/ui/menu/Menu.svelte";
    import MenuItem from "$components/ui/menu/MenuItem.svelte";
    import {page} from "$app/stores";
    import {goto} from "$app/navigation";
    import {activeProfileStore, maintenanceProfilesStore} from "$stores/maintenance-profiles-store.js";
    import ProfileView from "$components/maintenance/ProfileView.svelte";

    const profileId = $page.params.id;
    /** @type {import('$entities/MaintenanceProfile.ts').default|null} */
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
            goto('/features/maintenance');
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
    <MenuItem href="/features/maintenance" icon="arrow-left">Back</MenuItem>
    <hr>
</Menu>
{#if profile}
    <ProfileView {profile}/>
{/if}
<Menu>
    <hr>
    <MenuItem icon="wrench" href="/features/maintenance/{profileId}/edit">Edit Profile</MenuItem>
    <MenuItem icon="tag" href="#" on:click={activateProfile}>
        {#if isActiveProfile}
            <span>Profile is Active</span>
        {:else}
            <span>Activate Profile</span>
        {/if}
    </MenuItem>
    <MenuItem icon="file-export" href="/features/maintenance/{profileId}/export">
        Export Profile
    </MenuItem>
    <MenuItem icon="trash" href="/features/maintenance/{profileId}/delete">
        Delete Profile
    </MenuItem>
</Menu>

<style lang="scss">
</style>
