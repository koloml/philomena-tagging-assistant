<script>
  import { version } from "$app/environment";
</script>

<footer>
  <a href="https://github.com/koloml/philomena-tagging-assistant/releases/tag/{version}" target="_blank">
    v{version}
  </a>
  <span>, made with ♥ by
    {#if __CURRENT_SITE__ === 'furbooru'}<i class="head"></i>{/if} KoloMl.</span>
</footer>

<style lang="scss">
  @use '$styles/colors';
  @use '$styles/environment';

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

  @if environment.$current-site == 'furbooru' {
    .head {
      content: '';
      height: 24px;
      width: 32px;
      display: inline-block;
      vertical-align: middle;
      background: {
        image: url(/src/assets/heads/avali-optimized.svg);
        size: contain;
        repeat: no-repeat;
      };
    }
  }
</style>
