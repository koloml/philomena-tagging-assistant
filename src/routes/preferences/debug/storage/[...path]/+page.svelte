<script>
    import StorageViewer from "$components/debugging/StorageViewer.svelte";
    import {page} from "$app/stores";
    import {goto} from "$app/navigation";

    let pathString = '';
    /** @type {string[]} */
    let pathArray = [];
    /** @type {string|undefined} */
    let storageName = void 0;

    $: {
        pathString = $page.params.path;
        pathArray = pathString.length ? pathString.split("/") : [];
        storageName = pathArray.shift()

        if (pathArray.length && pathArray[pathArray.length - 1] === '') {
            pathArray.pop();
        }

        if (!storageName) {
            goto("/preferences/debug/storage");
        }
    }
</script>

{#if storageName}
    <StorageViewer storage="{storageName}" path="{pathArray}"></StorageViewer>
{/if}
