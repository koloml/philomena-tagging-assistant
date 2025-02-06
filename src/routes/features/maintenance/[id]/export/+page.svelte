<script>
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { maintenanceProfilesStore } from "$stores/maintenance-profiles-store";
    import Menu from "$components/ui/menu/Menu.svelte";
    import MenuItem from "$components/ui/menu/MenuItem.svelte";
    import FormContainer from "$components/ui/forms/FormContainer.svelte";
    import FormControl from "$components/ui/forms/FormControl.svelte";
    import EntitiesTransporter from "$lib/extension/EntitiesTransporter";
    import MaintenanceProfile from "$entities/MaintenanceProfile";

    const profileId = $page.params.id;
    const profile = $maintenanceProfilesStore.find(profile => profile.id === profileId);

    const profilesTransporter = new EntitiesTransporter(MaintenanceProfile);
    /** @type {string} */
    let exportedProfile = '';
    /** @type {string} */
    let compressedProfile = '';

    if (!profile) {
        goto('/features/maintenance/');
    } else {
        exportedProfile = profilesTransporter.exportToJSON(profile);
        compressedProfile = profilesTransporter.exportToCompressedJSON(profile);
    }

    let isCompressedProfileShown = true;
</script>

<Menu>
    <MenuItem href="/features/maintenance/{profileId}" icon="arrow-left">
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
