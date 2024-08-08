<script>
    /** @type {string|undefined} */
    export let name = undefined;

    /** @type {string|undefined} */
    export let placeholder = undefined;

    /** @type {string} */
    export let value = '';
</script>

<input type="text" {name} {placeholder} bind:value={value}>

<style lang="scss">
    :global(.control) input {
        width: 100%;
    }
</style>
