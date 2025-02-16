<script>
    import Menu from "$components/ui/menu/Menu.svelte";
    import MenuItem from "$components/ui/menu/MenuItem.svelte";
    import TagsEditor from "$components/tags/TagsEditor.svelte";
    import FormControl from "$components/ui/forms/FormControl.svelte";
    import TextField from "$components/ui/forms/TextField.svelte";
    import FormContainer from "$components/ui/forms/FormContainer.svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { maintenanceProfiles } from "$stores/entities/maintenance-profiles";
    import MaintenanceProfile from "$entities/MaintenanceProfile";

    /** @type {string} */
    let profileId = $page.params.id;
    /** @type {MaintenanceProfile|null} */
    let targetProfile = null;

    /** @type {string} */
    let profileName = '';
    /** @type {string[]} */
    let tagsList = [];

    if (profileId === 'new') {
        targetProfile = new MaintenanceProfile(crypto.randomUUID(), {});
    } else {
        const maybeExistingProfile = $maintenanceProfiles.find(profile => profile.id === profileId);

        if (maybeExistingProfile) {
            targetProfile = maybeExistingProfile;
            profileName = targetProfile.settings.name;
            tagsList = [...targetProfile.settings.tags].sort((a, b) => a.localeCompare(b));
        } else {
            goto('/features/maintenance');
        }
    }

    async function saveProfile() {
        if (!targetProfile) {
            console.warn('Attempting to save the profile, but the profile is not loaded yet.');
            return;
        }

        targetProfile.settings.name = profileName;
        targetProfile.settings.tags = [...tagsList];
        targetProfile.settings.temporary = false;

        await targetProfile.save();
        await goto('/features/maintenance/' + targetProfile.id);
    }
</script>

<Menu>
    <MenuItem icon="arrow-left" href="/features/maintenance{profileId === 'new' ? '' : '/' + profileId}">
        Back
    </MenuItem>
    <hr>
</Menu>
<FormContainer>
    <FormControl label="Profile Name">
        <TextField bind:value={profileName} placeholder="Profile Name"></TextField>
    </FormControl>
    <FormControl label="Tags">
        <TagsEditor bind:tags={tagsList}></TagsEditor>
    </FormControl>
</FormContainer>
<Menu>
    <hr>
    <MenuItem href="#" on:click={saveProfile}>Save Profile</MenuItem>
</Menu>
