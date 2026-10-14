import { UserDetails } from "$lib/extension/preferences/UserDetails";

(async () => {
  const userDetails = new UserDetails();
  const userDataStore = document.querySelector<HTMLElement>('.js-datastore');

  if (!userDataStore) {
    return;
  }

  await userDetails.isAuthorized.set(userDataStore.dataset.userIsSignedIn === 'true');
})();


