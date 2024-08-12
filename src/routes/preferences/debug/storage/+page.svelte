<script>
    import MenuItem from "$components/ui/menu/MenuItem.svelte";
    import Menu from "$components/ui/menu/Menu.svelte";
    import {storagesCollection} from "$stores/debug.js";
</script>

<Menu>
    <MenuItem href="/preferences/debug" icon="arrow-left">Back</MenuItem>
    <hr>
    {#each Object.keys($storagesCollection) as storageName}
        <MenuItem href="/preferences/debug/storage/{storageName}/">Storage: {storageName}</MenuItem>
    {/each}
</Menu>
