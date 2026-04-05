import StorageEntity from "$lib/extension/base/StorageEntity";

interface TagEditorPresetSettings {
  name: string;
  tags: string[];
  conditional: boolean;
  requiredTags: string[];
}

export default class TagEditorPreset extends StorageEntity<TagEditorPresetSettings> {
  constructor(id: string, settings: Partial<TagEditorPresetSettings>) {
    super(id, {
      name: settings.name || '',
      tags: settings.tags || [],
      conditional: settings.conditional || false,
      requiredTags: settings.requiredTags || [],
    });
  }

  public static readonly _entityName = 'presets';
}
