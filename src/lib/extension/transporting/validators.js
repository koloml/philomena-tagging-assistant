/**
 * Map of validators for each entity. Function should throw the error if validation failed.
 * @type {Map<keyof App.EntityNamesMap|string, ((importedObject: Object) => void)>}
 */
const entitiesValidators = new Map([
  ['profiles', importedObject => {
    if (importedObject.v !== 1) {
      throw new Error('Unsupported version!');
    }

    if (
      !importedObject.id
      || typeof importedObject.id !== "string"
      || !importedObject.name
      || typeof importedObject.name !== "string"
      || !importedObject.tags
      || !Array.isArray(importedObject.tags)
    ) {
      throw new Error('Invalid profile format detected!');
    }
  }]
])

/**
 * Validate the structure of the entity.
 * @param {Object} importedObject Object imported from JSON.
 * @param {string} entityName Name of the entity to validate. Should be loaded from the entity class.
 * @throws {Error} Error in case validation failed with the reason stored in the message.
 */
export function validateImportedEntity(importedObject, entityName) {
  if (!entitiesValidators.has(entityName)) {
    console.error(`Trying to validate entity without the validator present! Entity name: ${entityName}`);
    return;
  }

  entitiesValidators
    .get(entityName)
    .call(null, importedObject);
}
