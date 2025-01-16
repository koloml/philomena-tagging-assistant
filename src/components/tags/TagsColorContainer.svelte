<script>
    /** @type {string} */
    export let targetCategory = '';
</script>

<div class="tag-color-container tag-color-container--{targetCategory || 'default'}">
    <slot></slot>
</div>

<style lang="scss">
    @use '$styles/colors';

    .tag-color-container:is(.tag-color-container--rating) :global(.tag) {
        background-color: colors.$tag-rating-background;
        color: colors.$tag-rating-text;
    }

    .tag-color-container:is(.tag-color-container--spoiler) :global(.tag) {
        background-color: colors.$tag-spoiler-background;
        color: colors.$tag-spoiler-text;
    }

    .tag-color-container:is(.tag-color-container--origin) :global(.tag) {
        background-color: colors.$tag-origin-background;
        color: colors.$tag-origin-text;
    }

    .tag-color-container:is(.tag-color-container--oc) :global(.tag) {
        background-color: colors.$tag-oc-background;
        color: colors.$tag-oc-text;
    }

    .tag-color-container:is(.tag-color-container--error) :global(.tag) {
        background-color: colors.$tag-error-background;
        color: colors.$tag-error-text;
    }

    .tag-color-container:is(.tag-color-container--character) :global(.tag) {
        background-color: colors.$tag-character-background;
        color: colors.$tag-character-text;
    }

    .tag-color-container:is(.tag-color-container--content-official) :global(.tag) {
        background-color: colors.$tag-content-official-background;
        color: colors.$tag-content-official-text;
    }

    .tag-color-container:is(.tag-color-container--content-fanmade) :global(.tag) {
        background-color: colors.$tag-content-fanmade-background;
        color: colors.$tag-content-fanmade-text;
    }

    .tag-color-container:is(.tag-color-container--species) :global(.tag) {
        background-color: colors.$tag-species-background;
        color: colors.$tag-species-text;
    }

    .tag-color-container:is(.tag-color-container--body-type) :global(.tag) {
        background-color: colors.$tag-body-type-background;
        color: colors.$tag-body-type-text;
    }
</style>
