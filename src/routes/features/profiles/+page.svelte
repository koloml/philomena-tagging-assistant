<script lang="ts">
  import Menu from "$components/ui/menu/Menu.svelte";
  import MenuItem from "$components/ui/menu/MenuItem.svelte";
  import MenuRadioItem from "$components/ui/menu/MenuRadioItem.svelte";
  import { activeTaggingProfile, taggingProfiles } from "$stores/entities/tagging-profiles";
  import TaggingProfile from "$entities/TaggingProfile";
  import { popupTitle } from "$stores/popup";
  import { user } from "$stores/preferences/user";
  import Notice from "$components/ui/Notice.svelte";

  $popupTitle = 'Tagging Profiles';

  let profiles = $derived<TaggingProfile[]>(
    $taggingProfiles.sort((a, b) => a.settings.name.localeCompare(b.settings.name))
  );

  function resetActiveProfile() {
    $activeTaggingProfile = null;
  }

  function enableSelectedProfile(event: Event) {
    const target = event.target;

    if (target instanceof HTMLInputElement && target.checked) {
      activeTaggingProfile.set(target.value);
    }
  }
</script>

<Menu>
  <MenuItem href="/" icon="arrow-left">Back</MenuItem>
  <MenuItem href="/features/profiles/new/edit" icon="plus">Create New</MenuItem>
</Menu>
{#if $user?.isAuthorized === false}
  <Menu>
    <hr>
  </Menu>
  <Notice level="warning">
    <strong>Tagging profiles will only work when you're signed in!</strong>
    <br><br>
    Unauthorized users have to solve the captcha before sending any submissions to the site.
  </Notice>
{/if}
<Menu>
  {#if profiles.length}
    <hr>
  {/if}
  {#each profiles as profile}
    <MenuRadioItem href="/features/profiles/{profile.id}"
                   name="active-profile"
                   value={profile.id}
                   checked={$activeTaggingProfile === profile.id}
                   oninput={enableSelectedProfile}>
      {profile.settings.name}
    </MenuRadioItem>
  {/each}
  <hr>
  <MenuItem href="#" onclick={resetActiveProfile}>Reset Active Profile</MenuItem>
  <MenuItem href="/features/profiles/import">Import Profile</MenuItem>
</Menu>
