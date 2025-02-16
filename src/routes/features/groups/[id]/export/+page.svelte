<script>
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import FormContainer from "$components/ui/forms/FormContainer.svelte";
    import FormControl from "$components/ui/forms/FormControl.svelte";
    import Menu from "$components/ui/menu/Menu.svelte";
    import MenuItem from "$components/ui/menu/MenuItem.svelte";
    import TagGroup from "$entities/TagGroup";
    import EntitiesTransporter from "$lib/extension/EntitiesTransporter";
    import { tagGroups } from "$stores/entities/tag-groups";

    const groupId = $page.params.id;
    const groupTransporter = new EntitiesTransporter(TagGroup);
    const group = $tagGroups.find(group => group.id === groupId);

    /** @type {string} */
    let rawExportedGroup;
    /** @type {string} */
    let encodedExportedGroup;

    if (!group) {
        goto('/features/groups');
    } else {
        rawExportedGroup = groupTransporter.exportToJSON(group);
        encodedExportedGroup = groupTransporter.exportToCompressedJSON(group);
    }

    let isEncodedGroupShown = true;
</script>

<Menu>
    <MenuItem href="/features/groups/{groupId}" icon="arrow-left">Back</MenuItem>
    <hr>
</Menu>
<FormContainer>
    <FormControl label="Export string">
        <textarea readonly rows="6">{isEncodedGroupShown ? encodedExportedGroup : rawExportedGroup}</textarea>
    </FormControl>
</FormContainer>
<Menu>
    <hr>
    <MenuItem on:click={() => isEncodedGroupShown = !isEncodedGroupShown}>
        Switch Format:
        {#if isEncodedGroupShown}
            Base64-Encoded
        {:else}
            Raw JSON
        {/if}
    </MenuItem>
</Menu>
