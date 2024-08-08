<script>
    import MenuLink from "$components/ui/menu/MenuItem.svelte";

    /**
     * @type {boolean}
     */
    export let checked;

    /**
     * @type {string}
     */
    export let name;

    /**
     * @type {string}
     */
    export let value;

    /**
     * @type {string|null}
     */
    export let href = null;
</script>

<MenuLink {href}>
    <input type="radio" {name} {value} {checked} on:input on:click|stopPropagation>
    <slot></slot>
</MenuLink>

<style lang="scss">
    :global(.menu-item) input {
        width: 16px;
        height: 16px;
        margin-right: 6px;
    }
</style>
