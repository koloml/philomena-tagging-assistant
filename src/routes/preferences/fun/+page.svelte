<script>
  import Menu from "$components/ui/menu/Menu.svelte";
  import MenuItem from "$components/ui/menu/MenuItem.svelte";
  import FormContainer from "$components/ui/forms/FormContainer.svelte";
  import FormControl from "$components/ui/forms/FormControl.svelte";
  import CheckboxField from "$components/ui/forms/CheckboxField.svelte";
  import { useAvaliFont } from "$stores/preferences/fun";
  import Notice from "$components/ui/Notice.svelte";
</script>

<Menu>
  <MenuItem href="/preferences" icon="arrow-left">Back</MenuItem>
  <hr>
</Menu>
<Notice level="warning">
  These features are not to mean be really useful. Just a little bit of fun.
</Notice>
<Menu>
  <hr>
</Menu>
<FormContainer>
  <FormControl>
    <CheckboxField bind:checked={$useAvaliFont}>
      <strong>Display everything in Avali Scratch</strong><br>
      <small>
        This will apply the special font across the whole website, making it unusable unless you can read Avali Scratch
        alphabet. Unfortunately, text will flicker on every page load.
      </small>
    </CheckboxField>
  </FormControl>
</FormContainer>
