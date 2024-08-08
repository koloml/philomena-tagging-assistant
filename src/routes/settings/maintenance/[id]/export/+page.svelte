<script>
    import {page} from "$app/stores";
    import {goto} from "$app/navigation";
    import {maintenanceProfilesStore} from "$stores/maintenance-profiles-store.js";
    import Menu from "$components/ui/menu/Menu.svelte";
    import MenuItem from "$components/ui/menu/MenuItem.svelte";
    import FormContainer from "$components/ui/forms/FormContainer.svelte";
    import FormControl from "$components/ui/forms/FormControl.svelte";

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
        exportedProfile = profile.toJSON();
        compressedProfile = profile.toCompressedJSON();
    }

    let isCompressedProfileShown = true;
</script>

<Menu>
    <MenuItem href="/settings/maintenance/{profileId}" icon="arrow-left">
        Back
    </MenuItem>
    <hr>
</Menu>
<FormContainer>
    <FormControl label="Export string">
        <textarea readonly rows="6">{isCompressedProfileShown ? compressedProfile : exportedProfile}</textarea>
    </FormControl>
</FormContainer>
<Menu>
    <hr>
    <MenuItem on:click={() => isCompressedProfileShown = !isCompressedProfileShown}>
        Switch Format:
        {#if isCompressedProfileShown}
            Base64-Encoded
        {:else}
            Raw JSON
        {/if}
    </MenuItem>
</Menu>
