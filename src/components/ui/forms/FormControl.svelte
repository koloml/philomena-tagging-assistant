<script>

    /** @type {string|undefined} */
    export let label = undefined;
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
        padding: 5px 0;

        :global(textarea) {
            width: 100%;
            resize: vertical;
        }
    }
</style>
