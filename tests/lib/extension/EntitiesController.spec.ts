import EntitiesController from "$lib/extension/EntitiesController";
import ChromeStorageArea from "$tests/mocks/ChromeStorageArea";
import StorageHelper from "$lib/browser/StorageHelper";
import { TestedEntity, type TestedSettings } from "$tests/stubs/Entity";
import { randomString } from "$tests/utils";
import { randomInt } from "crypto";

describe('EntitiesController', () => {
  let mockedStorage: ChromeStorageArea;

  beforeEach(() => {
    mockedStorage = new ChromeStorageArea();
    EntitiesController.storage = new StorageHelper(mockedStorage);
  });

  it('should throw when storage is not present', async () => {
    EntitiesController.storage = null;

    const readPromise = EntitiesController.readAllEntities(
      TestedEntity._entityName,
      TestedEntity,
    );

    const deletePromise = EntitiesController.deleteEntity(
      TestedEntity._entityName,
      randomString(),
    );

    const updatePromise = EntitiesController.updateEntity(
      TestedEntity._entityName,
      new TestedEntity(randomString(), {
        numberField: randomInt(1000),
        stringField: randomString(),
      }),
    );

    const subscribe = () => {
      EntitiesController.subscribeToEntity(TestedEntity._entityName, TestedEntity, vi.fn());
    }

    await expect(readPromise).rejects.toThrow(Error);
    await expect(deletePromise).rejects.toThrow(Error);
    await expect(updatePromise).rejects.toThrow(Error);

    expect(subscribe).toThrow(Error);
  });

  describe('readAllEntities', () => {
    it('should return empty array when nothing in the storage yet', async () => {
      const entities = await EntitiesController.readAllEntities(TestedEntity._entityName, TestedEntity);
      expect(entities).toHaveLength(0);
    });

    it('should properly capture different entities from storage', async () => {
      const storageWithEntities: Record<string, Record<string, Partial<TestedSettings>>> = {
        [TestedEntity._entityName]: {
          [randomString()]: {
            stringField: randomString(),
            numberField: randomInt(-100_000, 100_000),
          },
          [randomString()]: {
            stringField: randomString(),
            numberField: randomInt(-100_000, 100_000),
          },
        }
      };

      mockedStorage.insertMockedData(storageWithEntities);

      const loadedEntities = await EntitiesController.readAllEntities(TestedEntity._entityName, TestedEntity);

      expect(loadedEntities).toHaveLength(2);

      for (const entity of loadedEntities) {
        const rawStorageEntry = storageWithEntities[TestedEntity._entityName][entity.id];

        expect(entity.settings.stringField).toBe(rawStorageEntry.stringField);
        expect(entity.settings.numberField).toBe(rawStorageEntry.numberField);
      }
    });
  });

  describe('updateEntity', () => {
    it('should create a storage structure if it is not created yet', async () => {
      expect(mockedStorage.mockedData).toEqual({});

      const entity = new TestedEntity(randomString(), {
        stringField: randomString(),
        numberField: randomInt(100_000),
      });

      await EntitiesController.updateEntity(TestedEntity._entityName, entity);

      expect(mockedStorage.mockedData).toEqual({
        [TestedEntity._entityName]: {
          [entity.id]: {
            stringField: entity.settings.stringField,
            numberField: entity.settings.numberField,
          },
        },
      });
    });

    it('should update entity inside the existing', async () => {
      const id = randomString();
      const initialStringValue = randomString();
      const updatedStringValue = randomString();

      mockedStorage.insertMockedData({
        [TestedEntity._entityName]: {
          [id]: {
            stringField: initialStringValue,
            numberField: randomInt(100_000),
          } as TestedSettings,
        }
      });

      const [entity] = await EntitiesController.readAllEntities(TestedEntity._entityName, TestedEntity);
      expect(entity.settings.stringField).toBe(initialStringValue);

      entity.settings.stringField = updatedStringValue;
      await EntitiesController.updateEntity(TestedEntity._entityName, entity);

      const entityInsideStorage = mockedStorage.mockedData[TestedEntity._entityName][id];
      expect(entityInsideStorage.stringField).toBe(updatedStringValue);
    });
  });

  describe('deleteEntity', () => {
    it('should initialize the storage structure if delete called', async () => {
      expect(mockedStorage.mockedData).toEqual({});

      await EntitiesController.deleteEntity(TestedEntity._entityName, randomString());

      expect(mockedStorage.mockedData).toEqual({
        [TestedEntity._entityName]: {},
      });
    });

    it('should delete entity and keep the storage object empty', async () => {
      const id = randomString();
      const settings: TestedSettings = {
        numberField: randomInt(100_000),
        stringField: randomString(),
      };

      mockedStorage.insertMockedData({
        [TestedEntity._entityName]: {
          [id]: settings,
        }
      });

      // Doesn't touch existing instance if ID is not found in the storage
      await EntitiesController.deleteEntity(TestedEntity._entityName, randomString());

      expect(mockedStorage.mockedData).toEqual({
        [TestedEntity._entityName]: {
          [id]: settings,
        }
      });

      await EntitiesController.deleteEntity(TestedEntity._entityName, id);

      expect(mockedStorage.mockedData).toEqual({
        [TestedEntity._entityName]: {}
      });
    });
  });

  describe('subscribeToEntity', () => {
    it('should notify about changes and return new entities', async () => {
      let receivedEntities: TestedEntity[] | null = null;

      const subscriber = vi.fn((entities: TestedEntity[]) => {
        receivedEntities = entities;
      });

      void EntitiesController.subscribeToEntity(TestedEntity._entityName, TestedEntity, subscriber);

      expect(subscriber).not.toHaveBeenCalled();

      const createdEntity = new TestedEntity(randomString(), {
        numberField: randomInt(100),
        stringField: randomString(),
      });

      await EntitiesController.updateEntity(TestedEntity._entityName, createdEntity);

      await vi.waitFor(() => {
        expect(subscriber).toHaveBeenCalled();
      }, {interval: 1, timeout: 10});

      const [firstReceivedEntity] = receivedEntities || [];

      expect(firstReceivedEntity).toBeInstanceOf(TestedEntity);
      expect(firstReceivedEntity).not.toBe(createdEntity);
      expect(firstReceivedEntity).toEqual(createdEntity);
    });

    it('should stop receiving updates once unsubscribed', async () => {
      const firstSubscriber = vi.fn();
      const unsubscribeFirst = EntitiesController.subscribeToEntity(TestedEntity._entityName, TestedEntity, firstSubscriber);

      const entity = new TestedEntity(randomString(), {
        numberField: randomInt(100_000),
        stringField: randomString(),
      });

      await EntitiesController.updateEntity(TestedEntity._entityName, entity);

      await vi.waitFor(() => {
        expect(firstSubscriber).toHaveBeenCalledOnce();
      }, {interval: 1, timeout: 10});

      firstSubscriber.mockReset();
      unsubscribeFirst();

      const secondSubscriber = vi.fn();
      void EntitiesController.subscribeToEntity(TestedEntity._entityName, TestedEntity, secondSubscriber);

      entity.settings.stringField = randomString();

      await EntitiesController.updateEntity(TestedEntity._entityName, entity);

      await vi.waitFor(() => {
        expect(secondSubscriber).toHaveBeenCalledOnce();
      }, {interval: 1, timeout: 10});

      expect(firstSubscriber).not.toHaveBeenCalled();
    });

    it('should not notify when something else was changed in the storage', async () => {
      const rawStorageSubscriber = vi.fn();
      const entitiesSubscriber = vi.fn();

      void EntitiesController.storage?.subscribe(rawStorageSubscriber);
      void EntitiesController.subscribeToEntity(TestedEntity._entityName, TestedEntity, entitiesSubscriber);

      EntitiesController.storage?.write('otherStorage', {
        someField: randomString(),
      });

      await EntitiesController.updateEntity(
        TestedEntity._entityName,
        new TestedEntity(randomString(), {
          stringField: randomString(),
          numberField: randomInt(100_000),
        }),
      );

      EntitiesController.storage?.write('otherStorage', {
        someField: randomString(),
      });

      await vi.waitFor(() => {
        expect(entitiesSubscriber).toHaveBeenCalledOnce();
        expect(rawStorageSubscriber).toHaveBeenCalledTimes(3);
      }, {timeout: 10, interval: 1});
    })
  });
});
