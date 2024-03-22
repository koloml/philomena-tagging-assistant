<script>

    /** @type {string|undefined} */
    export let label;
</script>

<label class="control">
    {#if label}
        <div class="label">{label}</div>
    {/if}
    <slot></slot>
</label>

<style lang="scss">

</style>
