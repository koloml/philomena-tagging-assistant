<script>
    import Menu from "$components/ui/menu/Menu.svelte";
    import MenuItem from "$components/ui/menu/MenuItem.svelte";
    import FormContainer from "$components/ui/forms/FormContainer.svelte";
    import FormControl from "$components/ui/forms/FormControl.svelte";
    import {
        searchPropertiesSuggestionsEnabled,
        searchPropertiesSuggestionsPosition
    } from "$stores/preferences/search";
    import CheckboxField from "$components/ui/forms/CheckboxField.svelte";
    import SelectField from "$components/ui/forms/SelectField.svelte";

    const propertiesPositions = {
        start: "At the start of the list",
        end: "At the end of the list",
    }
</script>

<Menu>
    <MenuItem icon="arrow-left" href="/preferences">Back</MenuItem>
    <hr>
</Menu>
<FormContainer>
    <FormControl>
        <CheckboxField bind:checked={$searchPropertiesSuggestionsEnabled}>
            Auto-complete properties
        </CheckboxField>
    </FormControl>
    {#if $searchPropertiesSuggestionsEnabled}
        <FormControl label="Show completed properties:">
            <SelectField bind:value={$searchPropertiesSuggestionsPosition}
                         options="{propertiesPositions}"></SelectField>
        </FormControl>
    {/if}
</FormContainer>
