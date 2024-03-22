<nav>
    <slot></slot>
</nav>

<style lang="scss">
    @use 'src/styles/colors';

    nav {
        display: flex;
        flex-direction: column;

        & > :global(a) {
            padding: 5px 24px;
        }

        :global(a) {
            color: colors.$text;

            &:hover {
                background: colors.$header-mobile-link-hover;
            }
        }

        :global(hr) {
            background: colors.$block-border;
            margin: .5em 24px;
            border: 0;
            height: 1px;
        }

        :global(main) > & {
            margin: {
                left: -24px;
                right: -24px;
            }
        }
    }
</style>
