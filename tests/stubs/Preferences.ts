import CacheablePreferences, { PreferenceField, type WithFields } from "$lib/extension/base/CacheablePreferences";
import ChromeStorageArea from "$tests/mocks/ChromeStorageArea";
import StorageHelper from "$lib/browser/StorageHelper";
import ConfigurationController from "$lib/extension/ConfigurationController";

export interface TestedFields {
  numberField: number;
  stringField: string;
}

export class TestedPreferences extends CacheablePreferences<TestedFields> implements WithFields<TestedFields> {
  readonly defaults: TestedFields;
  readonly mockedSettingsNamespace: string;
  readonly mockedStorageArea: ChromeStorageArea;
  readonly mockedStorageHelper: StorageHelper;

  numberField;
  stringField;

  constructor(settingsNamespace: string, mockedDefaults: TestedFields) {
    const mockedStorageArea = new ChromeStorageArea();
    const mockedStorageHelper = new StorageHelper(mockedStorageArea);
    const mockedConfigurationController = new ConfigurationController(
      settingsNamespace,
      mockedStorageHelper,
    );

    super(settingsNamespace, mockedConfigurationController);

    this.mockedSettingsNamespace = settingsNamespace;
    this.mockedStorageArea = mockedStorageArea;
    this.mockedStorageHelper = mockedStorageHelper;
    this.defaults = mockedDefaults;

    this.numberField = new PreferenceField(this, {
      field: 'numberField',
      defaultValue: this.defaults.numberField,
    });

    this.stringField = new PreferenceField(this, {
      field: 'stringField',
      defaultValue: this.defaults.stringField,
    });
  }
}
