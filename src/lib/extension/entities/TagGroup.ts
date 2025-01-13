import StorageEntity from "$lib/extension/base/StorageEntity.ts";

export interface TagGroupSettings {
  name: string;
  tags: string[];
  prefixes: string[];
  category: string;
}

export default class TagGroup extends StorageEntity<TagGroupSettings> {
  constructor(id: string, settings: Partial<TagGroupSettings>) {
    super(id, {
      name: settings.name || '',
      tags: settings.tags || [],
      prefixes: settings.prefixes || [],
      category: settings.category || ''
    });
  }

  static _entityName = 'groups';
}
