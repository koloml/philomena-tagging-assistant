<script>
  import "$lib/web-components/TagEditorComponent.js";

  /**
   * @type {string[]}
   */
  export let tags = [];

  let tagsAttribute = tags.join(',');

  /**
   * @param {CustomEvent<string[]>} event
   */
  function onTagsChanged(event) {
    tags = event.detail;
  }

  $: tagsAttribute = tags.join(',');
</script>

<tags-editor tags="{tagsAttribute}" on:change={onTagsChanged}></tags-editor>