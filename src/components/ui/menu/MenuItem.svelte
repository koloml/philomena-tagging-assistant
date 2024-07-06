<script>
    /**
     * @type {string|null}
     */
    export let href = null;

    /**
     * @type {"tag"|"paint-brush"|"arrow-left"|"info-circle"|"wrench"|"globe"|"plus"|null}
     */
    export let icon = null;

    /**
     * @type {"_blank"|"_self"|"_parent"|"_top"|undefined}
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
