<script>
    import CheckboxField from "$components/ui/forms/CheckboxField.svelte";
    import FormContainer from "$components/ui/forms/FormContainer.svelte";
    import FormControl from "$components/ui/forms/FormControl.svelte";
    import Menu from "$components/ui/menu/Menu.svelte";
    import MenuItem from "$components/ui/menu/MenuItem.svelte";
    import { stripBlacklistedTagsEnabled } from "$stores/maintenance-preferences.ts";
</script>

<Menu>
    <MenuItem icon="arrow-left" href="/preferences">Back</MenuItem>
    <hr>
</Menu>
<FormContainer>
    <FormControl>
        <CheckboxField bind:checked={$stripBlacklistedTagsEnabled}>
            Automatically remove black-listed tags from the images
        </CheckboxField>
    </FormControl>
</FormContainer>
