<script>
    /**
     * List of tags to edit. Any duplicated tags present in the array will be removed on the first edit.
     * @type {string[]}
     */
    export let tags = [];

    /** @type {Set<string>} */
    let uniqueTags = new Set();

    $: uniqueTags = new Set(tags);

    /** @type {string} */
    let addedTagName = '';

    /**
     * Create a callback function to pass into both mouse & keyboard events for tag removal.
     * @param {string} tagName
     * @return {function(Event)} Callback to pass as event listener.
     */
    function createTagRemoveHandler(tagName) {
        return event => {
            if (event.type === 'click') {
                removeTag(tagName);
            }

            if (event instanceof KeyboardEvent && (event.code === 'Enter' || event.code === 'Space')) {
                // To be more comfortable, automatically focus next available tag's remove button in the list.
                if (event.currentTarget instanceof HTMLElement) {
                    const currenTagElement = event.currentTarget.closest('.tag');
                    const nextTagElement = currenTagElement?.previousElementSibling ?? currenTagElement?.parentElement?.firstElementChild;
                    const nextRemoveButton = nextTagElement?.querySelector('.remove');

                    if (nextRemoveButton instanceof HTMLElement) {
                        nextRemoveButton.focus();
                    }
                }

                removeTag(tagName);
            }
        }
    }

    /**
     * @param {string} tagName
     */
    function removeTag(tagName) {
        uniqueTags.delete(tagName);
        tags = Array.from(uniqueTags);
    }

    /**
     * @param {string} tagName
     */
    function addTag(tagName) {
        uniqueTags.add(tagName);
        tags = Array.from(uniqueTags);
    }

    /**
     * Handle adding new tags to the list or removing them when backspace is pressed.
     * @param {KeyboardEvent} event
     */
    function handleKeyPresses(event) {
        if (event.code === 'Enter' && addedTagName.length) {
            addTag(addedTagName)
            addedTagName = '';
        }

        if (event.code === 'Backspace' && !addedTagName.length && tags?.length) {
            removeTag(tags[tags.length - 1]);
        }
    }
</script>

<div class="tags-editor">
    {#each uniqueTags.values() as tagName}
        <div class="tag">
            {tagName}
            <span class="remove" on:click={createTagRemoveHandler(tagName)}
                  on:keydown={createTagRemoveHandler(tagName)}
                  role="button" tabindex="0">x</span>
        </div>
    {/each}
    <input type="text" bind:value={addedTagName} on:keydown={handleKeyPresses}/>
</div>

<style lang="scss">
    .tags-editor {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }
</style>
