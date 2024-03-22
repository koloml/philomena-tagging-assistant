<script>
    import Menu from "$components/ui/menu/Menu.svelte";
    import MenuLink from "$components/ui/menu/MenuLink.svelte";
    import {page} from "$app/stores";
    import {goto} from "$app/navigation";

    import {onDestroy} from "svelte";
    import {activeProfileStore, maintenanceProfilesStore} from "$stores/maintenance-profiles-store.js";

    const profileId = $page.params.id;
    /** @type {import('$lib/extension/entities/MaintenanceProfile.js').default|null} */
    let profile = null;
    let isActiveProfile = false;

    if (profileId === 'new') {
        goto('/maintenance/profiles/new/edit');
    }

    const unsubscribeFromProfiles = maintenanceProfilesStore.subscribe(profiles => {
        const resolvedProfile = profiles.find(p => p.id === profileId);

        if (resolvedProfile) {
            profile = resolvedProfile;
            return;
        }

        console.warn(`Profile ${profileId} not found.`);
        goto('/settings/maintenance');
    });

    const unsubscribeFromActiveProfile = activeProfileStore.subscribe(activeProfileId => {
        isActiveProfile = activeProfileId === profileId;
    })

    function activateProfile() {
        if (isActiveProfile) {
            return;
        }

        activeProfileStore.set(profileId);
    }

    onDestroy(() => {
        unsubscribeFromProfiles();
        unsubscribeFromActiveProfile();
    });
</script>

<Menu>
    <MenuLink href="/settings/maintenance" icon="arrow-left">Back</MenuLink>
    <hr>
</Menu>
{#if profile}
    <div>
        <strong>Profile:</strong><br>
        {profile.settings.name}
    </div>
    <div>
        <strong>Focused Tags:</strong>
        <div class="tags-list">
            {#each profile.settings.tags as tagName}
                <span class="tag">{tagName}</span>
            {/each}
        </div>
    </div>
{/if}
<Menu>
    <hr>
    <MenuLink icon="wrench" href="/settings/maintenance/{profileId}/edit">Edit Profile</MenuLink>
    <MenuLink icon="tag" href="#" on:click={activateProfile}>
        {#if isActiveProfile}
            <span>Profile is Active</span>
        {:else}
            <span>Activate Profile</span>
        {/if}
    </MenuLink>
</Menu>
<style>
    .tags-list {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }
</style>