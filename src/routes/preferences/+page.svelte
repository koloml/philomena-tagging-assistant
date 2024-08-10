<script>
    import Menu from "$components/ui/menu/Menu.svelte";
    import MenuItem from "$components/ui/menu/MenuItem.svelte";
</script>

<Menu>
    <MenuItem href="/" icon="arrow-left">Back</MenuItem>
    <hr>
    <MenuItem href="/preferences/search">Search</MenuItem>
    <MenuItem href="/preferences/misc">Misc & Tools</MenuItem>
</Menu>
