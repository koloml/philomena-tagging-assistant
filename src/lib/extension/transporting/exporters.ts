import StorageEntity from "$lib/extension/base/StorageEntity.ts";

type ExportersMap = {
  [EntityName in keyof App.EntityNamesMap]: (entity: App.EntityNamesMap[EntityName]) => Record<string, any>
};

const entitiesExporters: ExportersMap = {
  profiles: entity => {
    return {
      v: 1,
      id: entity.id,
      name: entity.settings.name,
      tags: entity.settings.tags,
    }
  },
  groups: entity => {
    return {
      v: 1,
      id: entity.id,
      name: entity.settings.name,
      tags: entity.settings.tags,
      prefixes: entity.settings.prefixes,
    }
  }
};

export function exportEntityToObject(entityInstance: StorageEntity<any>, entityName: string): Record<string, any> {
  if (!(entityName in entitiesExporters) || !entitiesExporters.hasOwnProperty(entityName)) {
    throw new Error(`Missing exporter for entity: ${entityName}`);
  }

  return entitiesExporters[entityName as keyof App.EntityNamesMap].call(null, entityInstance);
}
