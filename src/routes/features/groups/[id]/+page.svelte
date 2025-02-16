<script>
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import GroupView from "$components/features/GroupView.svelte";
    import Menu from "$components/ui/menu/Menu.svelte";
    import MenuItem from "$components/ui/menu/MenuItem.svelte";
    import { tagGroups } from "$stores/entities/tag-groups";

    const groupId = $page.params.id;
    /** @type {import('$entities/TagGroup').default|null} */
    let group = null;

    if (groupId === 'new') {
        goto('/features/groups/new/edit');
    }

    $: {
        group = $tagGroups.find(group => group.id === groupId) || null;

        if (!group) {
            console.warn(`Group ${groupId} not found.`);
            goto('/features/groups');
        }
    }
</script>

<Menu>
    <MenuItem href="/features/groups" icon="arrow-left">Back</MenuItem>
    <hr>
</Menu>
{#if group}
    <GroupView {group}/>
{/if}
<Menu>
    <hr>
    <MenuItem href="/features/groups/{groupId}/edit" icon="wrench">Edit Group</MenuItem>
    <MenuItem href="/features/groups/{groupId}/export" icon="file-export">Export Group</MenuItem>
    <MenuItem href="/features/groups/{groupId}/delete" icon="trash">Delete Group</MenuItem>
</Menu>
