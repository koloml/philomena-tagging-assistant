<script>
    import { version } from "$app/environment";
</script>

<footer>
    <a href="https://github.com/koloml/furbooru-tagging-assistant/releases/tag/{version}" target="_blank">
        v{version}
    </a>
    <span>, made with ♥ by KoloMl.</span>
</footer>

<style lang="scss">
    @use '$styles/colors';

    footer {
        display: flex;
        width: 100%;
        background: colors.$footer;
        color: colors.$footer-text;
        padding: 0 24px;
        font-size: 12px;
        line-height: 36px;

        a {
            color: inherit;

            &:hover {
                text-decoration: underline;
            }
        }
    }
</style>
