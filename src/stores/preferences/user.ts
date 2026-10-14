import { UserDetails, type UserDetailsFields } from "$lib/extension/preferences/UserDetails";
import { readable } from "svelte/store";

const userDetails = new UserDetails();

export const user = readable<UserDetailsFields | null>(null, set => {
  userDetails.subscribe(settings => {
    set({
      isAuthorized: Boolean(settings.isAuthorized)
    });
  });

  userDetails.isAuthorized.get().then(isAuthorized => {
    set({
      isAuthorized
    });
  });
});
