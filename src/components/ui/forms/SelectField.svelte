<script>
    /**
     * @type {string[]|Record<string, string>}
     */
    export let options = [];

    /** @type {string|undefined} */
    export let name = undefined;

    /** @type {string|undefined} */
    export let id = undefined;

    /** @type {string|undefined} */
    export let value = undefined;

    /** @type {Record<string, string>} */
    const optionPairs = {};

    if (Array.isArray(options)) {
        for (let option of options) {
            optionPairs[option] = option;
        }
    } else if (options && typeof options === 'object') {
        Object.keys(options).forEach((key) => {
            optionPairs[key] = options[key];
        })
    }
</script>

<select {name} {id} bind:value={value}>
    {#each Object.entries(optionPairs) as [value, label]}
        <option {value}>{label}</option>
    {/each}
</select>
