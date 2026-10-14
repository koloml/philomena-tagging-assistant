import ChromeStorageArea from "$tests/mocks/ChromeStorageArea";
import StorageHelper from "$lib/browser/StorageHelper";
import { randomString } from "$tests/utils";
import { randomInt } from "crypto";
import EntitiesController from "$lib/extension/EntitiesController";
import { TestedEntity } from "$tests/stubs/Entity";

describe("StorageEntity", () => {
  let mockedStorageArea: ChromeStorageArea;

  beforeEach(() => {
    mockedStorageArea = new ChromeStorageArea();
    EntitiesController.storage = new StorageHelper(mockedStorageArea);
  });

  describe("readAll", () => {
    it("should return empty array if no entities stored", async () => {
      const entities = await TestedEntity.readAll();

      expect(entities).toHaveLength(0);
    });

    it("should read all entities from storage", async () => {
      const entity1 = new TestedEntity(randomString(), {
        stringField: randomString(),
        numberField: randomInt(-100000, 100000),
      });

      const entity2 = new TestedEntity(randomString(), {
        stringField: randomString(),
        numberField: randomInt(-100000, 100000),
      });

      await entity1.save();
      await entity2.save();

      const entities = await TestedEntity.readAll();

      expect(entities).toHaveLength(2);
      expect(entities[0].id).toBe(entity1.id);
      expect(entities[0].settings).toEqual(entity1.settings);
      expect(entities[1].id).toBe(entity2.id);
      expect(entities[1].settings).toEqual(entity2.settings);
    });

    it("should build entities with correct class", async () => {
      const entity = new TestedEntity(randomString(), {
        stringField: randomString(),
        numberField: randomInt(-100000, 100000),
      });

      await entity.save();

      const [savedEntity] = await TestedEntity.readAll();

      expect(savedEntity).toBeInstanceOf(TestedEntity);
    });
  });

  describe("save", () => {
    it("should save entity to storage", async () => {
      const entity = new TestedEntity(randomString(), {
        stringField: randomString(),
        numberField: randomInt(-100000, 100000),
      });

      await entity.save();

      expect(mockedStorageArea.mockedData).toEqual({
        [TestedEntity._entityName]: {
          [entity.id]: entity.settings,
        },
      });
    });

    it("should overwrite existing entity with same ID", async () => {
      const id = randomString();
      const originalSettings = {
        stringField: randomString(),
        numberField: randomInt(-100000, 100000),
      };

      const entity1 = new TestedEntity(id, originalSettings);
      await entity1.save();

      const updatedSettings = {
        stringField: randomString(),
        numberField: randomInt(-100000, 100000),
      };

      const entity2 = new TestedEntity(id, updatedSettings);
      await entity2.save();

      expect(mockedStorageArea.mockedData).toEqual({
        [TestedEntity._entityName]: {
          [id]: updatedSettings,
        },
      });
    });
  });

  describe("delete", () => {
    it("should delete entity from storage", async () => {
      const entity = new TestedEntity(randomString(), {
        stringField: randomString(),
        numberField: randomInt(-100000, 100000),
      });

      await entity.save();
      expect(mockedStorageArea.mockedData[TestedEntity._entityName]).not.toEqual({});

      await entity.delete();
      expect(mockedStorageArea.mockedData[TestedEntity._entityName]).toEqual({});
    });

    it("should not fail if entity does not exist", async () => {
      const entity = new TestedEntity(randomString(), {
        stringField: randomString(),
        numberField: randomInt(-100000, 100000),
      });

      await expect(entity.delete()).resolves.not.toThrow();
    });
  });

  describe("subscribe", () => {
    it("should notify about new entities", async () => {
      const subscriber = vi.fn();
      void TestedEntity.subscribe(subscriber);

      const entity = new TestedEntity(randomString(), {
        stringField: randomString(),
        numberField: randomInt(-100000, 100000),
      });

      await entity.save();

      // Saving is not notified about immediately.
      await vi.waitFor(() => {
        expect(subscriber).toHaveBeenCalledOnce();
        expect(subscriber).toHaveBeenCalledWith([entity]);
      }, {timeout: 10, interval: 1});
    });

    it("should notify about entity updates", async () => {
      const subscriber = vi.fn();
      void TestedEntity.subscribe(subscriber);

      const entity = new TestedEntity(randomString(), {
        stringField: randomString(),
        numberField: randomInt(-100000, 100000),
      });

      await entity.save();

      await vi.waitFor(() => {
        expect(subscriber).toHaveBeenCalledOnce();
      }, {interval: 1, timeout: 10});

      subscriber.mockReset();

      entity.settings.stringField = randomString();
      await entity.save();

      await vi.waitFor(() => {
        expect(subscriber).toHaveBeenCalledOnce();
        expect(subscriber).toHaveBeenCalledWith([entity]);
      }, {interval: 1, timeout: 10});
    });

    it("should notify about entity deletion", async () => {
      const subscriber = vi.fn();
      void TestedEntity.subscribe(subscriber);

      const entity = new TestedEntity(randomString(), {
        stringField: randomString(),
        numberField: randomInt(-100000, 100000),
      });

      await entity.save();
      await entity.delete();

      await vi.waitFor(() => {
        expect(subscriber).toHaveBeenCalledTimes(2);
      }, {interval: 1, timeout: 10});

      expect(subscriber).toHaveBeenCalledWith([entity]);
      expect(subscriber).toHaveBeenCalledWith([]);
    });

    it("should stop notifications after unsubscribe", async () => {
      const subscriber = vi.fn();
      const unsubscribe = TestedEntity.subscribe(subscriber);

      unsubscribe();

      const entity = new TestedEntity(randomString(), {
        stringField: randomString(),
        numberField: randomInt(-100000, 100000),
      });

      await entity.save();

      expect(subscriber).not.toHaveBeenCalled();
    });
  });

  describe("properties", () => {
    it("should expose id", () => {
      const id = randomString();
      const entity = new TestedEntity(id, {
        stringField: randomString(),
        numberField: randomInt(-100000, 100000),
      });

      expect(entity.id).toBe(id);
    });

    it("should expose settings", () => {
      const settings = {
        stringField: randomString(),
        numberField: randomInt(-100000, 100000),
      };

      const entity = new TestedEntity(randomString(), settings);

      expect(entity.settings).toEqual(settings);
    });

    it("should expose type from _entityName", () => {
      const entity = new TestedEntity(randomString(), {
        stringField: randomString(),
        numberField: randomInt(-100000, 100000),
      });

      expect(entity.type).toBe(TestedEntity._entityName);
    });
  });
});
