<script>
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import Menu from "$components/ui/menu/Menu.svelte";
    import MenuItem from "$components/ui/menu/MenuItem.svelte";
    import { tagGroupsStore } from "$stores/tag-groups-store.js";

    const groupId = $page.params.id;
    const targetGroup = $tagGroupsStore.find(group => group.id===groupId);

    if (!targetGroup) {
        void goto('/features/groups');
    }

    async function deleteGroup() {
        if (!targetGroup) {
            console.warn('Attempting to delete the group, but the group is not loaded yet.');
            return;
        }

        await targetGroup.delete();
        await goto('/features/groups');
    }
</script>

<Menu>
    <MenuItem icon="arrow-left" href="/features/groups/{groupId}">Back</MenuItem>
    <hr>
</Menu>
{#if targetGroup}
    <p>
        Do you want to remove group "{targetGroup.settings.name}"? This action is irreversible.
    </p>
    <Menu>
        <hr>
        <MenuItem on:click={deleteGroup}>Yes</MenuItem>
        <MenuItem href="/features/groups/{groupId}">No</MenuItem>
    </Menu>
{:else}
    <p>Loading...</p>
{/if}
