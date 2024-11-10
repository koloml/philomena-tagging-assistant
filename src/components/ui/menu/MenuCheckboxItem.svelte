<script>
    import MenuLink from "$components/ui/menu/MenuItem.svelte";

    /**
     * @type {boolean}
     */
    export let checked;

    /**
     * @type {string|undefined}
     */
    export let name = undefined;

    /**
     * @type {string|undefined}
     */
    export let value = undefined;

    /**
     * @type {string|null}
     */
    export let href = null;
</script>

<MenuLink {href}>
    <input type="checkbox" {name} {value} {checked} on:input on:click|stopPropagation>
    <slot></slot>
</MenuLink>

<style lang="scss">
    :global(.menu-item) input {
        width: 16px;
        height: 16px;
        margin-right: 6px;
    }
</style>
