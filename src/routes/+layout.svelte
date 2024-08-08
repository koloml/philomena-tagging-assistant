<script>
    import "../styles/popup.scss";
    import Header from "$components/layout/Header.svelte";
    import Footer from "$components/layout/Footer.svelte";

    // Sort of a hack, detect if we rendered in the browser tab or in the popup.
    // Popup will always should have fixed 320px size, otherwise we consider it opened in the tab.
    document.body.classList.toggle('is-in-tab', window.innerWidth > 320);
</script>

<Header/>
<main>
    <slot/>
</main>
<Footer/>

<style lang="scss" global>
    main {
        padding: .5em 24px;
    }
</style>
