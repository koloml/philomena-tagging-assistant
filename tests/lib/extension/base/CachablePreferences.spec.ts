import { randomString } from "$tests/utils";
import { randomInt } from "crypto";
import { TestedPreferences } from "$tests/stubs/Preferences";

describe('CachablePreferences', () => {
  let preferences: TestedPreferences;

  beforeEach(() => {
    preferences = new TestedPreferences(randomString(), {
      numberField: randomInt(-100_000, 100_000),
      stringField: randomString(),
    });
  });

  describe('PreferenceField', () => {
    it('should get/set values in preferences with defaults in mind', async () => {
      expect(await preferences.numberField.get()).toBe(preferences.defaults.numberField);
      expect(await preferences.stringField.get()).toBe(preferences.defaults.stringField);

      const randomUpdatedNumber = randomInt(100_000_000);
      const randomUpdatedString = randomString();

      await preferences.numberField.set(randomUpdatedNumber);
      await preferences.stringField.set(randomUpdatedString);

      expect(await preferences.numberField.get()).toBe(randomUpdatedNumber);
      expect(await preferences.stringField.get()).toBe(randomUpdatedString);
    });
  });

  it('should not store anything unless written into', async () => {
    expect(preferences.mockedStorageArea.mockedData).toEqual({});

    const randomValue = randomInt(10000000);
    await preferences.numberField.set(randomValue);

    expect(preferences.mockedStorageArea.mockedData).toEqual({
      [preferences.mockedSettingsNamespace]: {
        numberField: randomValue,
      },
    });
  });

  it('should read from cache on subsequent reads', async () => {
    void await preferences.readRaw('numberField', preferences.defaults.numberField);
    expect(preferences.mockedStorageArea.get).toHaveBeenCalledOnce();

    preferences.mockedStorageArea.get.mockReset();

    void await preferences.readRaw('numberField', preferences.defaults.numberField);
    expect(preferences.mockedStorageArea.get).not.toHaveBeenCalled();
  });

  it('should not write if cached value is the same unless forced to', async () => {
    const firstValue = randomString();
    const secondValue = randomString();

    void await preferences.writeRaw('stringField', firstValue);
    expect(preferences.mockedStorageArea.set).toHaveBeenCalledOnce();

    preferences.mockedStorageArea.set.mockReset();

    void await preferences.writeRaw('stringField', firstValue);
    expect(preferences.mockedStorageArea.set).not.toHaveBeenCalled();

    preferences.mockedStorageArea.set.mockReset();

    void await preferences.writeRaw('stringField', secondValue);
    expect(preferences.mockedStorageArea.set).toHaveBeenCalledOnce();

    preferences.mockedStorageArea.set.mockReset();

    void await preferences.writeRaw('stringField', secondValue, true);
    expect(preferences.mockedStorageArea.set).toHaveBeenCalledOnce();
  });

  it('will avoid writing default value if field was accessed previously', async () => {
    void await preferences.stringField.get();
    void await preferences.stringField.set(preferences.defaults.stringField);

    expect(preferences.mockedStorageArea.set).not.toHaveBeenCalled();
    expect(preferences.mockedStorageArea.mockedData).toEqual({});
  });

  it('should notify about changes', async () => {
    const subscriber = vi.fn();
    preferences.subscribe(subscriber);

    const updatedValue = randomString();
    await preferences.stringField.set(updatedValue);

    expect(subscriber).toHaveBeenCalledWith({
      stringField: updatedValue,
    });
  });

  it('should stop sending changes when unsubscribed', async () => {
    const subscriber = vi.fn();
    const unsubscribe = preferences.subscribe(subscriber);

    const updatedValue = randomString();
    await preferences.stringField.set(updatedValue);

    expect(subscriber).toHaveBeenCalledOnce();

    subscriber.mockReset();
    unsubscribe();

    const secondUpdatedValue = randomString();
    await preferences.stringField.set(secondUpdatedValue);

    expect(subscriber).not.toHaveBeenCalled();
  });

  it('should dispose of all subscriptions', async () => {
    const subscriber = vi.fn();
    preferences.subscribe(subscriber);

    await preferences.stringField.set(randomString());
    expect(subscriber).toHaveBeenCalledOnce();

    subscriber.mockReset();

    preferences.dispose();

    await preferences.stringField.set(randomString());
    expect(subscriber).not.toHaveBeenCalled();
  });
});
