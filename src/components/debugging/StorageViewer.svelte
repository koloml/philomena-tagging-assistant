<script>
    import Menu from "$components/ui/menu/Menu.svelte";
    import MenuItem from "$components/ui/menu/MenuItem.svelte";
    import { storagesCollection } from "$stores/debug";
    import { goto } from "$app/navigation";
    import { findDeepObject } from "$lib/utils";

    /** @type {string} */
    export let storage;

    /** @type {string[]} */
    export let path;

    /** @type {Object|null} */
    let targetStorage = null;
    /** @type {[string, string][]} */
    let breadcrumbs = [];
    /** @type {Object<string, any>|null} */
    let targetObject = null;
    let targetPathString = '';

    $: {
        /** @type {[string, string][]} */
        const builtBreadcrumbs = [];

        breadcrumbs = path.reduce((resultCrumbs, entry) => {
            let entryPath = entry;

            if (resultCrumbs.length) {
                entryPath = resultCrumbs[resultCrumbs.length - 1][1] + "/" + entryPath;
            }

            resultCrumbs.push([entry, entryPath]);

            return resultCrumbs;
        }, builtBreadcrumbs);

        targetPathString = path.join("/");

        if (targetPathString.length) {
            targetPathString += "/";
        }
    }

    $: {
        targetStorage = $storagesCollection[storage];

        if (!targetStorage) {
            goto("/preferences/debug/storage");
        }
    }

    $: {
        targetObject = targetStorage
                ? findDeepObject(targetStorage, path)
                : null;
    }

    /**
     * Helper function to resolve type, including the null.
     * @param {*} value Value to resolve type from.
     * @return {string} Type of the value, including "null" for null.
     */
    function resolveType(value) {
        /** @type {string} */
        let typeName = typeof value;

        if (typeName === 'object' && value === null) {
            typeName = 'null';
        }

        return typeName;
    }

    /**
     * Helper function to resolve value, including values like null or undefined.
     * @param {*} value Value to resolve.
     * @return {string} String representation of the value.
     */
    function resolveValue(value) {
        if (value === null) {
            return "null";
        }

        if (value === undefined) {
            return "undefined";
        }

        return value?.toString() ?? '';
    }
</script>

<Menu>
    <MenuItem href="/preferences/debug/storage" icon="arrow-left">Back</MenuItem>
    <hr>
</Menu>
<p class="path">
    <span>/ <a href="/preferences/debug/storage/{storage}">{storage}</a></span>
    {#each breadcrumbs as [name, entryPath]}
        <span>/ <a href="/preferences/debug/storage/{storage}/{entryPath}/">{name}</a></span>
    {/each}
</p>
{#if targetObject}
    <Menu>
        <hr>
        {#each Object.entries(targetObject) as [key, value]}
            {#if targetObject[key] && typeof targetObject[key] === 'object'}
                <MenuItem href="/preferences/debug/storage/{storage}/{targetPathString}{key}">
                    {key}: Object
                </MenuItem>
            {:else}
                <MenuItem>
                    {key}: {resolveType(targetObject[key])} = {resolveValue(targetObject[key])}
                </MenuItem>
            {/if}
        {/each}
    </Menu>
{/if}

<style lang="scss">
    .path {
        display: flex;
        flex-wrap: wrap;
        column-gap: .5em;
    }
</style>
