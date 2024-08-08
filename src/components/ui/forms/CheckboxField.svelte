<script>
    /** @type {string|undefined} */
    export let name = undefined;

    /** @type {boolean} */
    export let checked;
</script>

<input type="checkbox" {name} bind:checked={checked}>
<span>
    <slot></slot>
</span>
