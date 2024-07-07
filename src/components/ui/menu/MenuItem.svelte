<script>
    /**
     * @type {string|null}
     */
    export let href = null;

    /**
     * @type {App.IconName|null}
     */
    export let icon = null;

    /**
     * @type {App.LinkTarget|undefined}
     */
    export let target = undefined;
</script>

<svelte:element this="{href ? 'a': 'span'}" class="menu-item" {href} {target} on:click role="link" tabindex="0">
    {#if icon}
        <i class="icon icon-{icon}"></i>
    {/if}
    <slot></slot>
</svelte:element>

<style lang="scss">
    @use '../../../styles/colors';

    .menu-item {
        display: flex;
        align-items: center;

        i {
            width: 16px;
            height: 16px;
            background: colors.$text;
            margin-right: 6px;
        }
    }
</style>
