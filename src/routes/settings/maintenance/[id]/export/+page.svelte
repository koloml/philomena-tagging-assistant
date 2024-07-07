<script>
    import {page} from "$app/stores";
    import {goto} from "$app/navigation";
    import {maintenanceProfilesStore} from "$stores/maintenance-profiles-store.js";
    import Menu from "$components/ui/menu/Menu.svelte";
    import MenuItem from "$components/ui/menu/MenuItem.svelte";
    import FormContainer from "$components/ui/forms/FormContainer.svelte";
    import {compressToEncodedURIComponent} from "lz-string";

    const profileId = $page.params.id;

    /**
     * @type {import('$lib/extension/entities/MaintenanceProfile.js').default|undefined}
     */
    const profile = $maintenanceProfilesStore.find(profile => profile.id === profileId);

    /** @type {string} */
    let exportedProfile = '';
    /** @type {string} */
    let compressedProfile = '';

    if (!profile) {
        goto('/settings/maintenance/');
    } else {
        exportedProfile = JSON.stringify({
            v: 1,
            id: profileId,
            name: profile?.settings.name,
            tags: profile.settings.tags,
        }, null, 2);

        compressedProfile = compressToEncodedURIComponent(exportedProfile);
    }

    let isCompressedProfileShown = true;
</script>

<Menu>
    <MenuItem href="/settings/maintenance/{profileId}" icon="arrow-left">
        Back
    </MenuItem>
    <hr>
    <MenuItem on:click={() => isCompressedProfileShown = !isCompressedProfileShown}>
        Export Format:
        {#if isCompressedProfileShown}
            Base64-Encoded
        {:else}
            Raw JSON
        {/if}
    </MenuItem>
    <hr>
</Menu>
<FormContainer>
    <textarea readonly rows="6">{isCompressedProfileShown ? compressedProfile : exportedProfile}</textarea>
</FormContainer>

<style lang="scss">
    textarea {
        resize: vertical;
    }
</style>
