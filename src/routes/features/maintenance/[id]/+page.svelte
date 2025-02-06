<script>
    import Menu from "$components/ui/menu/Menu.svelte";
    import MenuItem from "$components/ui/menu/MenuItem.svelte";
    import {page} from "$app/stores";
    import {goto} from "$app/navigation";
    import {activeProfileStore, maintenanceProfilesStore} from "$stores/maintenance-profiles-store.js";
    import ProfileView from "$components/features/ProfileView.svelte";
    import MenuCheckboxItem from "$components/ui/menu/MenuCheckboxItem.svelte";

    const profileId = $page.params.id;
    /** @type {import('$entities/MaintenanceProfile.ts').default|null} */
    let profile = null;

    if (profileId==='new') {
        goto('/features/maintenance/new/edit');
    }

    $: {
        const resolvedProfile = $maintenanceProfilesStore.find(profile => profile.id===profileId);

        if (resolvedProfile) {
            profile = resolvedProfile;
        } else {
            console.warn(`Profile ${profileId} not found.`);
            goto('/features/maintenance');
        }
    }

    let isActiveProfile = $activeProfileStore===profileId;

    $: {
        if (isActiveProfile && $activeProfileStore!==profileId) {
            $activeProfileStore = profileId;
        }

        if (!isActiveProfile && $activeProfileStore===profileId) {
            $activeProfileStore = null;
        }
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
    <MenuCheckboxItem bind:checked={isActiveProfile}>
        Activate Profile
    </MenuCheckboxItem>
    <MenuItem icon="file-export" href="/features/maintenance/{profileId}/export">
        Export Profile
    </MenuItem>
    <MenuItem icon="trash" href="/features/maintenance/{profileId}/delete">
        Delete Profile
    </MenuItem>
</Menu>

<style lang="scss">
</style>
