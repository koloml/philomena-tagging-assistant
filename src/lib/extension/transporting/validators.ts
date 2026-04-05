import type StorageEntity from "$lib/extension/base/StorageEntity";
import type { ImportableEntityObject } from "$lib/extension/transporting/importables";

/**
 * Function for validating the entities.
 * @todo Probably would be better to replace the throw-catch method with some kind of result-error returning type.
 *   Errors are only properly definable in the JSDoc.
 */
type ValidationFunction<EntityType extends StorageEntity> = (importedObject: ImportableEntityObject<EntityType>) => void;

/**
 * Mapping of validation functions for all entities present in the extension. Key is a name of entity and value is a
 * function which throws an error when validation is failed.
 */
type EntitiesValidationMap = {
  [EntityKey in keyof App.EntityNamesMap]?: ValidationFunction<App.EntityNamesMap[EntityKey]>;
};

/**
 * Check if the following value is defined, not empty and is of correct type.
 * @param value Value to be checked.
 */
function validateRequiredString(value: unknown): boolean {
  return Boolean(value && typeof value === 'string');
}

/**
 * Check if the following value is not set or is a valid array.
 * @param value Value to be checked.
 */
function validateOptionalArray(value: unknown): boolean {
  return value === undefined || value === null || Array.isArray(value);
}

/**
 * Check if the following value is not set or is a valid boolean.
 * @param value Value to be checked.
 */
function validateOptionalBoolean(value: unknown): boolean {
  return value === undefined || typeof value === 'boolean';
}

/**
 * Map of validators for each entity. Function should throw the error if validation failed.
 */
const entitiesValidators: EntitiesValidationMap = {
  profiles: importedObject => {
    if (!importedObject.v || importedObject.v > 2) {
      throw new Error('Unsupported profile version!');
    }

    if (
      !validateRequiredString(importedObject?.id)
      || !validateRequiredString(importedObject?.name)
      || !validateOptionalArray(importedObject?.tags)
    ) {
      throw new Error('Invalid profile format detected!');
    }
  },
  groups: importedObject => {
    if (!importedObject.v || importedObject.v > 2) {
      throw new Error('Unsupported group version!');
    }

    if (
      !validateRequiredString(importedObject?.id)
      || !validateRequiredString(importedObject?.name)
      || !validateOptionalArray(importedObject?.tags)
      || !validateOptionalArray(importedObject?.prefixes)
      || !validateOptionalArray(importedObject?.suffixes)
    ) {
      throw new Error('Invalid group format detected!');
    }
  },
  presets: importedObject => {
    if (!importedObject.v || importedObject.v > 1) {
      throw new Error('Unsupported preset version!');
    }

    if (
      !validateRequiredString(importedObject?.id)
      || !validateRequiredString(importedObject?.name)
      || !validateOptionalArray(importedObject?.tags)
      || !validateOptionalBoolean(importedObject?.exclusive)
      || !validateOptionalBoolean(importedObject?.conditional)
      || !validateOptionalArray(importedObject?.requiredTags)
    ) {
      throw new Error('Invalid preset format detected!');
    }
  }
};

/**
 * Validate the structure of the entity.
 * @param entityName Name of the entity to validate. Should be loaded from the entity class.
 * @param importedObject Object imported from JSON.
 * @throws {Error} Error in case validation failed with the reason stored in the message.
 */
export function validateImportedEntity<EntityName extends keyof App.EntityNamesMap>(
  entityName: EntityName,
  importedObject: any
) {
  if (!entitiesValidators.hasOwnProperty(entityName)) {
    console.error(`Trying to validate entity without the validator present! Entity name: ${entityName}`);
    return;
  }

  entitiesValidators[entityName]!.call(null, importedObject);
}
