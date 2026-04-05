<script lang="ts">
  import type TagEditorPreset from "$entities/TagEditorPreset";
  import DetailsBlock from "$components/ui/DetailsBlock.svelte";
  import TagsList from "$components/tags/TagsList.svelte";

  interface PresetViewProps {
    preset: TagEditorPreset;
  }

  let { preset }: PresetViewProps = $props();

  const sortedTagsList = $derived(preset.settings.tags.toSorted((a, b) => a.localeCompare(b)));
</script>

<DetailsBlock title="Preset Name">
  {preset.settings.name}
</DetailsBlock>
<DetailsBlock title="Tags">
  <TagsList tags={sortedTagsList}></TagsList>
</DetailsBlock>
{#if preset.settings.exclusive}
  <DetailsBlock title="Exclusivity">
    Only one tag in this preset should be active at a time. If you will click on other non-active tag, other tags will
    be automatically removed from the editor.
  </DetailsBlock>
{/if}
