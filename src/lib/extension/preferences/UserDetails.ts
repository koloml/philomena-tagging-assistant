import CacheablePreferences, { PreferenceField, type WithFields } from "$lib/extension/base/CacheablePreferences";

export interface UserDetailsFields {
  isAuthorized: boolean;
}

export class UserDetails extends CacheablePreferences<UserDetailsFields> implements WithFields<UserDetailsFields> {
  constructor() {
    super('userDetails');
  }

  isAuthorized = new PreferenceField(this, {
    field: 'isAuthorized',
    defaultValue: false,
  });
}
