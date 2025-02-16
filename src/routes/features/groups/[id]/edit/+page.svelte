<script>
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import TagsColorContainer from "$components/tags/TagsColorContainer.svelte";
    import FormContainer from "$components/ui/forms/FormContainer.svelte";
    import FormControl from "$components/ui/forms/FormControl.svelte";
    import TagCategorySelectField from "$components/ui/forms/TagCategorySelectField.svelte";
    import TextField from "$components/ui/forms/TextField.svelte";
    import Menu from "$components/ui/menu/Menu.svelte";
    import MenuItem from "$components/ui/menu/MenuItem.svelte";
    import TagsEditor from "$components/tags/TagsEditor.svelte";
    import TagGroup from "$entities/TagGroup";
    import { tagGroups } from "$stores/entities/tag-groups";

    const groupId = $page.params.id;
    /** @type {TagGroup|null} */
    let targetGroup = null;

    let groupName = '';
    /** @type {string[]} */
    let tagsList = [];
    /** @type {string[]} */
    let prefixesList = [];
    let tagCategory = '';

    if (groupId === 'new') {
        targetGroup = new TagGroup(crypto.randomUUID(), {});
    } else {
        targetGroup = $tagGroups.find(group => group.id === groupId) || null;

        if (targetGroup) {
            groupName = targetGroup.settings.name;
            tagsList = [...targetGroup.settings.tags].sort((a, b) => a.localeCompare(b));
            prefixesList = [...targetGroup.settings.prefixes].sort((a, b) => a.localeCompare(b));
            tagCategory = targetGroup.settings.category;
        } else {
            goto('/features/groups');
        }
    }

    async function saveGroup() {
        if (!targetGroup) {
            console.warn('Attempting to save group, but group is not loaded yet.');
            return;
        }

        targetGroup.settings.name = groupName;
        targetGroup.settings.tags = [...tagsList];
        targetGroup.settings.prefixes = [...prefixesList];
        targetGroup.settings.category = tagCategory;

        await targetGroup.save();
        await goto(`/features/groups/${targetGroup.id}`);
    }
</script>

<Menu>
    <MenuItem href="/features/groups/${groupId}" icon="arrow-left">Back</MenuItem>
    <hr>
</Menu>
<FormContainer>
    <FormControl label="Group Name">
        <TextField bind:value={groupName} placeholder="Group Name"></TextField>
    </FormControl>
    <FormControl label="Group Color">
        <TagCategorySelectField bind:value={tagCategory}/>
    </FormControl>
    <TagsColorContainer targetCategory="{tagCategory}">
        <FormControl label="Tags">
            <TagsEditor bind:tags={tagsList}/>
        </FormControl>
    </TagsColorContainer>
    <TagsColorContainer targetCategory="{tagCategory}">
        <FormControl label="Tag Prefixes">
            <TagsEditor bind:tags={prefixesList}/>
        </FormControl>
    </TagsColorContainer>
</FormContainer>
<Menu>
    <hr>
    <MenuItem on:click={saveGroup}>Save Group</MenuItem>
</Menu>
