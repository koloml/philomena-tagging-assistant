<script>
    import TagsColorContainer from "$components/tags/TagsColorContainer.svelte";

    /**
     * @type {import('$entities/TagGroup.ts').default}
     */
    export let group;

    let sortedTagsList, sortedPrefixes;

    $: sortedTagsList = group.settings.tags.sort((a, b) => a.localeCompare(b));
    $: sortedPrefixes = group.settings.prefixes.sort((a, b) => a.localeCompare(b));
</script>

<div class="block">
    <strong>Group Name:</strong>
    <div>{group.settings.name}</div>
</div>
{#if sortedTagsList.length}
    <div class="block">
        <strong>Tags:</strong>
        <TagsColorContainer targetCategory="{group.settings.category}">
            <div class="tags-list">
                {#each sortedTagsList as tagName}
                    <span class="tag">{tagName}</span>
                {/each}
            </div>
        </TagsColorContainer>
    </div>
{/if}
{#if sortedPrefixes.length}
    <div class="block">
        <strong>Prefixes:</strong>
        <TagsColorContainer targetCategory="{group.settings.category}">
            <div class="tags-list">
                {#each sortedPrefixes as prefixName}
                    <span class="tag">{prefixName}*</span>
                {/each}
            </div>
        </TagsColorContainer>
    </div>
{/if}

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
