<script>
    /** @type {import('$lib/extension/entities/MaintenanceProfile.js').default} */
    export let profile;
</script>

<div class="block">
    <strong>Profile:</strong>
    <div>{profile.settings.name}</div>
</div>
<div class="block">
    <strong>Tags:</strong>
    <div class="tags-list">
        {#each profile.settings.tags as tagName}
            <span class="tag">{tagName}</span>
        {/each}
    </div>
</div>

<style lang="scss">
    .tags-list {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }

    .block + .block {
        margin-top: .5em;

        strong {
            display: block;
            margin-bottom: .25em;
        }
    }
</style>
