<script>
    import Menu from "$components/ui/menu/Menu.svelte";
    import MenuLink from "$components/ui/menu/MenuLink.svelte";
    import TagsEditor from "$components/web-components/TagsEditor.svelte";
    import FormControl from "$components/ui/forms/FormControl.svelte";
    import TextField from "$components/ui/forms/TextField.svelte";
    import FormContainer from "$components/ui/forms/FormContainer.svelte";
    import {page} from "$app/stores";
    import {goto} from "$app/navigation";
    import {maintenanceProfilesStore} from "$stores/maintenance-profiles-store.js";
    import MaintenanceProfile from "$entities/MaintenanceProfile.js";
    import {onDestroy} from "svelte";

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
        const maybeExistingProfile = $maintenanceProfilesStore.find(profile => profile.id === profileId);

        if (maybeExistingProfile) {
            targetProfile = maybeExistingProfile;
            profileName = targetProfile.settings.name;
            tagsList = [...targetProfile.settings.tags];
        } else {
            goto('/settings/maintenance');
        }
    }

    async function saveProfile() {
        if (!targetProfile) {
            console.warn('Attempting to save the profile, but the profile is not loaded yet.');
            return;
        }

        targetProfile.settings.name = profileName;
        targetProfile.settings.tags = [...tagsList];

        await targetProfile.save();
        await goto('/settings/maintenance/' + targetProfile.id);
    }

    async function deleteProfile() {
        if (!targetProfile) {
            console.warn('Attempting to delete the profile, but the profile is not loaded yet.');
            return;
        }

        await targetProfile.delete();
        await goto('/settings/maintenance');
    }
</script>

<Menu>
    <MenuLink icon="arrow-left" href="/settings/maintenance{profileId === 'new' ? '' : '/' + profileId}">
        Back
    </MenuLink>
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
    <MenuLink href="#" on:click={saveProfile}>Save Profile</MenuLink>
    {#if profileId !== 'new'}
        <MenuLink href="#" on:click={deleteProfile}>Delete Profile</MenuLink>
    {/if}
</Menu>
