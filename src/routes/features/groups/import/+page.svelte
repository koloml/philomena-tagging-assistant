<script>
    import { goto } from "$app/navigation";
    import GroupView from "$components/features/GroupView.svelte";
    import FormContainer from "$components/ui/forms/FormContainer.svelte";
    import FormControl from "$components/ui/forms/FormControl.svelte";
    import Menu from "$components/ui/menu/Menu.svelte";
    import MenuItem from "$components/ui/menu/MenuItem.svelte";
    import TagGroup from "$entities/TagGroup.ts";
    import EntitiesTransporter from "$lib/extension/EntitiesTransporter.ts";
    import { tagGroupsStore } from "$stores/tag-groups-store.js";

    const groupTransporter = new EntitiesTransporter(TagGroup);

    /** @type {string} */
    let importedString = '';
    /** @type {string} */
    let errorMessage = '';

    /** @type {TagGroup|null} */
    let candidateGroup = null;
    /** @type {TagGroup|null} */
    let existingGroup = null;

    function tryImportingGroup() {
        candidateGroup = null;
        existingGroup = null;

        errorMessage = '';
        importedString = importedString.trim();

        if (!importedString) {
            errorMessage = 'Nothing to import.';
            return;
        }

        try {
            if (importedString.trim().startsWith('{')) {
                candidateGroup = groupTransporter.importFromJSON(importedString);
            }

            candidateGroup = groupTransporter.importFromCompressedJSON(importedString);
        } catch (error) {
            errorMessage = error instanceof Error
                    ? error.message
                    :'Unknown error';
        }

        if (candidateGroup) {
            existingGroup = $tagGroupsStore.find(group => group.id===candidateGroup?.id) ?? null;
        }
    }

    function saveGroup() {
        if (!candidateGroup) {
            return;
        }

        candidateGroup.save().then(() => {
            goto(`/features/groups`);
        });
    }

    function cloneAndSaveGroup() {
        if (!candidateGroup) {
            return;
        }

        const clonedProfile = new TagGroup(crypto.randomUUID(), candidateGroup.settings);
        clonedProfile.settings.name += ` (Clone ${ new Date().toISOString() })`;
        clonedProfile.save().then(() => {
            goto(`/features/groups`);
        });
    }
</script>

<Menu>
    <MenuItem icon="arrow-left" href="/features/groups">Back</MenuItem>
    <hr>
</Menu>
{#if errorMessage}
    <p class="error">Failed to import: {errorMessage}</p>
    <Menu>
        <hr>
    </Menu>
{/if}
{#if !candidateGroup}
    <FormContainer>
        <FormControl label="Import string">
            <textarea bind:value={importedString} rows="6"></textarea>
        </FormControl>
    </FormContainer>
    <Menu>
        <hr>
        <MenuItem on:click={tryImportingGroup}>Import</MenuItem>
    </Menu>
{:else}
    {#if existingGroup}
        <p class="warning">
            This group will replace the existing "{existingGroup.settings.name}" group, since it have the same ID.
        </p>
    {/if}
    <GroupView group="{candidateGroup}"></GroupView>
    <Menu>
        <hr>
        {#if existingGroup}
            <MenuItem on:click={saveGroup}>Replace Existing Group</MenuItem>
            <MenuItem on:click={cloneAndSaveGroup}>Save as New Group</MenuItem>
        {:else}
            <MenuItem on:click={saveGroup}>Import New Group</MenuItem>
        {/if}
        <MenuItem on:click={() => candidateGroup = null}>Cancel</MenuItem>
    </Menu>
{/if}

<style lang="scss">
    @use '../../../../styles/colors';

    .error, .warning {
        padding: 5px 24px;
        margin: {
            left: -24px;
            right: -24px;
        }
    }

    .error {
        background: colors.$error-background;
    }

    .warning {
        background: colors.$warning-background;
        margin-bottom: .5em;
    }
</style>
