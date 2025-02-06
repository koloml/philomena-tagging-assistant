<script>
    import SelectField from "$components/ui/forms/SelectField.svelte";
    import { categories } from "$lib/booru/tag-categories";

    /** @type {string} */
    export let value = '';

    /** @type {Record<string, string>} */
    let tagCategoriesOptions = {
        '': 'Default'
    };

    tagCategoriesOptions = categories.reduce((options, category) => {
        options[category] = category
                .replace('-', ' ')
                .replace(/(?<=\s|^)\w/g, (matchedCharacter) => matchedCharacter.toUpperCase());

        return options;
    }, tagCategoriesOptions);
</script>

<SelectField bind:value={value} options={tagCategoriesOptions} name="tag_color"/>

<style lang="scss">
    @use '$styles/colors';

    :global(select[name=tag_color]) {
        :global(option) {
            &:is(:global([value=rating])) {
                background-color: colors.$tag-rating-background;
                color: colors.$tag-rating-text;
            }

            &:is(:global([value=spoiler])) {
                background-color: colors.$tag-spoiler-background;
                color: colors.$tag-spoiler-text;
            }

            &:is(:global([value=origin])) {
                background-color: colors.$tag-origin-background;
                color: colors.$tag-origin-text;
            }

            &:is(:global([value=oc])) {
                background-color: colors.$tag-oc-background;
                color: colors.$tag-oc-text;
            }

            &:is(:global([value=error])) {
                background-color: colors.$tag-error-background;
                color: colors.$tag-error-text;
            }

            &:is(:global([value=character])) {
                background-color: colors.$tag-character-background;
                color: colors.$tag-character-text;
            }

            &:is(:global([value=content-official])) {
                background-color: colors.$tag-content-official-background;
                color: colors.$tag-content-official-text;
            }

            &:is(:global([value=content-fanmade])) {
                background-color: colors.$tag-content-fanmade-background;
                color: colors.$tag-content-fanmade-text;
            }

            &:is(:global([value=species])) {
                background-color: colors.$tag-species-background;
                color: colors.$tag-species-text;
            }

            &:is(:global([value=body-type])) {
                background-color: colors.$tag-body-type-background;
                color: colors.$tag-body-type-text;
            }
        }
    }
</style>
