<script>
    import Menu from "$components/ui/menu/Menu.svelte";
    import MenuItem from "$components/ui/menu/MenuItem.svelte";
    import { tagGroupsStore } from "$stores/tag-groups-store";

    /** @type {import('$entities/TagGroup').default[]} */
    let groups = [];

    $: groups = $tagGroupsStore.sort((a, b) => a.settings.name.localeCompare(b.settings.name));
</script>

<Menu>
    <MenuItem href="/" icon="arrow-left">Back</MenuItem>
    <MenuItem href="/features/groups/new/edit" icon="plus">Create New</MenuItem>
    {#if groups.length}
        <hr>
        {#each groups as group}
            <MenuItem href="/features/groups/{group.id}">{group.settings.name}</MenuItem>
        {/each}
    {/if}
    <hr>
    <MenuItem href="/features/groups/import">Import Group</MenuItem>
</Menu>
