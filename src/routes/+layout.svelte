<script>
    import "../styles/popup.scss";
    import Header from "$components/layout/Header.svelte";
    import Footer from "$components/layout/Footer.svelte";
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
