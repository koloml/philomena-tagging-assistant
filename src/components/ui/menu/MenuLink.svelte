<script>
    /**
     * @type {string}
     */
    export let href;

    /**
     * @type {"tag"|"paint-brush"|"arrow-left"|"info-circle"|"wrench"|"globe"|"plus"|null}
     */
    export let icon = null;

    /**
     * @type {"_blank"|"_self"|"_parent"|"_top"|undefined}
     */
    export let target = undefined;
</script>

{#if href}
    <a {href} {target} on:click>
        {#if icon}
            <i class="icon icon-{icon}"></i>
        {/if}
        <slot></slot>
    </a>
{/if}

<style lang="scss">
    @use '../../../styles/colors';

    a {
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
