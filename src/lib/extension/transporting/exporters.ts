import StorageEntity from "$lib/extension/base/StorageEntity";
import type { ImportableEntityObject } from "$lib/extension/transporting/importables";

type ExporterFunction<EntityType extends StorageEntity> = (entity: EntityType) => ImportableEntityObject<EntityType>;

type ExportersMap = {
  [EntityName in keyof App.EntityNamesMap]: ExporterFunction<App.EntityNamesMap[EntityName]>;
}

const entitiesExporters: ExportersMap = {
  profiles: entity => {
    return {
      $type: "profiles",
      $site: __CURRENT_SITE__,
      v: 2,
      id: entity.id,
      name: entity.settings.name,
      tags: entity.settings.tags,
      // Any exported profile should be considered non-temporary.
      temporary: false,
    }
  },
  groups: entity => {
    return {
      $type: "groups",
      $site: __CURRENT_SITE__,
      v: 2,
      id: entity.id,
      name: entity.settings.name,
      tags: entity.settings.tags,
      prefixes: entity.settings.prefixes,
      suffixes: entity.settings.suffixes,
      category: entity.settings.category,
      separate: entity.settings.separate,
    }
  },
  presets: entity => {
    return {
      $type: "presets",
      $site: __CURRENT_SITE__,
      v: 1,
      id: entity.id,
      name: entity.settings.name,
      tags: entity.settings.tags,
      exclusive: entity.settings.exclusive,
    }
  }
};

export function exportEntityToObject<EntityName extends keyof App.EntityNamesMap>(
  entityName: EntityName,
  entityInstance: App.EntityNamesMap[EntityName]
): ImportableEntityObject<App.EntityNamesMap[EntityName]> {
  if (!(entityName in entitiesExporters) || !entitiesExporters.hasOwnProperty(entityName)) {
    throw new Error(`Missing exporter for entity: ${entityName}`);
  }

  return entitiesExporters[entityName].call(null, entityInstance);
}
