<script lang="ts">
  import { page } from "$app/state";
  import TagEditorPreset from "$entities/TagEditorPreset";
  import { tagEditorPresets } from "$stores/entities/tag-editor-presets";
  import { popupTitle } from "$stores/popup";
  import { goto } from "$app/navigation";
  import Menu from "$components/ui/menu/Menu.svelte";
  import MenuItem from "$components/ui/menu/MenuItem.svelte";
  import FormContainer from "$components/ui/forms/FormContainer.svelte";
  import FormControl from "$components/ui/forms/FormControl.svelte";
  import TextField from "$components/ui/forms/TextField.svelte";
  import TagsEditor from "$components/tags/TagsEditor.svelte";
  import CheckboxField from "$components/ui/forms/CheckboxField.svelte";

  let presetId = $derived(page.params.id);

  let targetPreset = $derived.by<TagEditorPreset | null>(() => {
    if (presetId === 'new') {
      return new TagEditorPreset(crypto.randomUUID(), {});
    }

    return $tagEditorPresets.find(preset => preset.id === presetId) || null;
  });

  let presetName = $state('');
  let tagsList = $state<string[]>([]);
  let isExclusive = $state(false);
  let isConditional = $state<boolean>(false);
  let requiredTags = $state<string[]>([]);

  $effect(() => {
    if (presetId === 'new') {
      $popupTitle = 'Create New Preset';
      return;
    }

    if (!targetPreset) {
      goto('/features/presets');
      return;
    }

    $popupTitle = `Edit Tagging Preset: ${targetPreset.settings.name}}`;

    presetName = targetPreset.settings.name;
    tagsList = [...targetPreset.settings.tags].sort((a, b) => a.localeCompare(b));
    isExclusive = targetPreset.settings.exclusive;
    isConditional = targetPreset.settings.conditional;
    requiredTags = [...targetPreset.settings.requiredTags].sort((a, b) => a.localeCompare(b));
  });

  async function savePreset() {
    if (!targetPreset) {
      console.warn('Attempting to save the preset, but the preset is not loaded yet.');
      return;
    }

    targetPreset.settings.name = presetName;
    targetPreset.settings.tags = [...tagsList];
    targetPreset.settings.exclusive = isExclusive;
    targetPreset.settings.conditional = isConditional;
    targetPreset.settings.requiredTags = [...requiredTags];

    await targetPreset.save();
    await goto(`/features/presets/${targetPreset.id}`);
  }
</script>

<Menu>
  <MenuItem href="/features/presets{presetId === 'new' ? '' : '/' + presetId}" icon="arrow-left">
    Back
  </MenuItem>
</Menu>
<FormContainer>
  <FormControl label="Preset Name">
    <TextField bind:value={presetName} placeholder="Preset Name"></TextField>
  </FormControl>
  <FormControl label="Tags">
    <TagsEditor bind:tags={tagsList}></TagsEditor>
  </FormControl>
  <FormControl>
    <CheckboxField bind:checked={isExclusive}>
      Keep only one tag from this preset active at a time.
    </CheckboxField>
  </FormControl>
  <FormControl>
    <CheckboxField bind:checked={isConditional}>
      Show this preset only when any of specified tags are provided.
    </CheckboxField>
  </FormControl>
  {#if isConditional}
    <FormControl label="Required Tags">
      <TagsEditor bind:tags={requiredTags}></TagsEditor>
    </FormControl>
  {/if}
</FormContainer>
<Menu>
  <hr>
  <MenuItem href="#" onclick={savePreset}>Save Preset</MenuItem>
</Menu>
