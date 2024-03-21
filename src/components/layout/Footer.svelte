<script>
  import {version} from "$app/environment";
</script>

<footer>
	v{version}, made with ♥ by KoloMl.
</footer>

<style lang="scss">
  @use 'src/styles/colors';

  footer {
    background: colors.$footer;
    color: colors.$footer-text;
	padding: 0 24px;
	font-size: 12px;
	line-height: 36px;
  }
</style>