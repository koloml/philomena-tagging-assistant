/**
 * @type {Map<string, ((entity: import('../base/StorageEntity.js').default) => Record<string, any>)>}
 */
const entitiesExporters = new Map([
  ['profiles', /** @param {import('../entities/MaintenanceProfile.js').default} entity */entity => {
    return {
      v: 1,
      id: entity.id,
      name: entity.settings.name,
      tags: entity.settings.tags,
    }
  }]
])

/**
 * @param entityInstance
 * @param {string} entityName
 * @returns {Record<string, *>}
 */
export function exportEntityToObject(entityInstance, entityName) {
  if (!entitiesExporters.has(entityName)) {
    throw new Error(`Missing exporter for entity: ${entityName}`);
  }

  return entitiesExporters.get(entityName).call(null, entityInstance);
}
