<script>
    import MenuItem from "$components/ui/menu/MenuItem.svelte";
    import Menu from "$components/ui/menu/Menu.svelte";
    import FormContainer from "$components/ui/forms/FormContainer.svelte";
    import FormControl from "$components/ui/forms/FormControl.svelte";
    import CheckboxField from "$components/ui/forms/CheckboxField.svelte";
    import { fullScreenViewerEnabled } from "$stores/misc-preferences";
</script>

<Menu>
    <MenuItem icon="arrow-left" href="/preferences">Back</MenuItem>
    <hr>
</Menu>
<FormContainer>
    <FormControl>
        <CheckboxField bind:checked={$fullScreenViewerEnabled}>
            Enable fullscreen viewer button
        </CheckboxField>
    </FormControl>
</FormContainer>
