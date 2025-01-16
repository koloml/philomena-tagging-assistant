<header>
    <a href="/">Furbooru Tagging Assistant</a>
</header>

<style lang="scss">
    @use "$styles/colors";

    header {
        background: colors.$header;
        padding: 0 24px;
        display: flex;
        position: sticky;
        top: 0;
        left: 0;
        right: 0;

        a {
            color: colors.$text;
            line-height: 36px;
            padding: 0 12px;
            margin-left: -12px;

            &:hover {
                background: colors.$header-hover-background;
            }
        }
    }
</style>
