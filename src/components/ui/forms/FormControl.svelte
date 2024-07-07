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
    .label {
        margin-bottom: .5em;
    }

    .control {
        :global(textarea) {
            width: 100%;
            resize: vertical;
        }
    }
</style>
