<script>
    import Menu from "$components/ui/menu/Menu.svelte";
    import MenuItem from "$components/ui/menu/MenuItem.svelte";
    import FormContainer from "$components/ui/forms/FormContainer.svelte";
    import MaintenanceProfile from "$entities/MaintenanceProfile";
    import FormControl from "$components/ui/forms/FormControl.svelte";
    import ProfileView from "$components/features/ProfileView.svelte";
    import { maintenanceProfilesStore } from "$stores/maintenance-profiles-store";
    import { goto } from "$app/navigation";
    import EntitiesTransporter from "$lib/extension/EntitiesTransporter";

    const profilesTransporter = new EntitiesTransporter(MaintenanceProfile);

    /** @type {string} */
    let importedString = '';
    /** @type {string} */
    let errorMessage = '';

    /** @type {MaintenanceProfile|null} */
    let candidateProfile = null;
    /** @type {MaintenanceProfile|null} */
    let existingProfile = null;

    function tryImportingProfile() {
        candidateProfile = null;
        existingProfile = null;

        errorMessage = '';
        importedString = importedString.trim();

        if (!importedString) {
            errorMessage = 'Nothing to import.';
            return;
        }

        try {
            if (importedString.trim().startsWith('{')) {
                candidateProfile = profilesTransporter.importFromJSON(importedString);
            }

            candidateProfile = profilesTransporter.importFromCompressedJSON(importedString);
        } catch (error) {
            errorMessage = error instanceof Error
                    ? error.message
                    : 'Unknown error';
        }

        if (candidateProfile) {
            existingProfile = $maintenanceProfilesStore.find(profile => profile.id === candidateProfile?.id) ?? null;
        }
    }

    function saveProfile() {
        if (!candidateProfile) {
            return;
        }

        candidateProfile.save().then(() => {
            goto(`/features/maintenance`);
        });
    }

    function cloneAndSaveProfile() {
        if (!candidateProfile) {
            return;
        }

        const clonedProfile = new MaintenanceProfile(crypto.randomUUID(), candidateProfile.settings);
        clonedProfile.settings.name += ` (Clone ${new Date().toISOString()})`;
        clonedProfile.save().then(() => {
            goto(`/features/maintenance`);
        });
    }
</script>

<Menu>
    <MenuItem icon="arrow-left" href="/features/maintenance">Back</MenuItem>
    <hr>
</Menu>
{#if errorMessage}
    <p class="error">Failed to import: {errorMessage}</p>
    <Menu>
        <hr>
    </Menu>
{/if}
{#if !candidateProfile}
    <FormContainer>
        <FormControl label="Import string">
            <textarea bind:value={importedString} rows="6"></textarea>
        </FormControl>
    </FormContainer>
    <Menu>
        <hr>
        <MenuItem on:click={tryImportingProfile}>Import</MenuItem>
    </Menu>
{:else}
    {#if existingProfile}
        <p class="warning">
            This profile will replace the existing "{existingProfile.settings.name}" profile, since it have the same ID.
        </p>
    {/if}
    <ProfileView profile="{candidateProfile}"></ProfileView>
    <Menu>
        <hr>
        {#if existingProfile}
            <MenuItem on:click={saveProfile}>Replace Existing Profile</MenuItem>
            <MenuItem on:click={cloneAndSaveProfile}>Save as New Profile</MenuItem>
        {:else}
            <MenuItem on:click={saveProfile}>Import New Profile</MenuItem>
        {/if}
        <MenuItem on:click={() => candidateProfile = null}>Cancel</MenuItem>
    </Menu>
{/if}

<style lang="scss">
    @use '$styles/colors';

    .error, .warning {
        padding: 5px 24px;
        margin: {
            left: -24px;
            right: -24px;
        }
    }

    .error {
        background: colors.$error-background;
    }

    .warning {
        background: colors.$warning-background;
        margin-bottom: .5em;
    }
</style>
