<script>
    import Menu from "$components/ui/menu/Menu.svelte";
    import MenuItem from "$components/ui/menu/MenuItem.svelte";
    import FormContainer from "$components/ui/forms/FormContainer.svelte";
    import FormControl from "$components/ui/forms/FormControl.svelte";
    import {
        searchPropertiesSuggestionsEnabled,
        searchPropertiesSuggestionsPosition
    } from "$stores/search-preferences.js";
    import CheckboxField from "$components/ui/forms/CheckboxField.svelte";
    import SelectField from "$components/ui/forms/SelectField.svelte";
</script>

<Menu>
    <MenuItem icon="arrow-left" href="/preferences">Back</MenuItem>
    <hr>
</Menu>
<FormContainer>
    <FormControl>
        <CheckboxField bind:checked={$searchPropertiesSuggestionsEnabled}>
            Enable auto-completion for properties
        </CheckboxField>
    </FormControl>
    <FormControl label="Location of properties suggestions">
        <SelectField bind:value={$searchPropertiesSuggestionsPosition} options="{['start', 'end']}"></SelectField>
    </FormControl>
</FormContainer>
