<script>
    /** @type {import('$entities/MaintenanceProfile.ts').default} */
    export let profile;

    const sortedTagsList = profile.settings.tags.sort((a, b) => a.localeCompare(b));
</script>

<div class="block">
    <strong>Profile:</strong>
    <div>{profile.settings.name}</div>
</div>
<div class="block">
    <strong>Tags:</strong>
    <div class="tags-list">
        {#each sortedTagsList as tagName}
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
