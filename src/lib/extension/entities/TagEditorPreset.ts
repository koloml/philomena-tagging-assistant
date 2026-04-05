import StorageEntity from "$lib/extension/base/StorageEntity";

interface TagEditorPresetSettings {
  name: string;
  tags: string[];
  exclusive: boolean;
}

export default class TagEditorPreset extends StorageEntity<TagEditorPresetSettings> {
  constructor(id: string, settings: Partial<TagEditorPresetSettings>) {
    super(id, {
      name: settings.name || '',
      tags: settings.tags || [],
      exclusive: settings.exclusive ?? false
    });
  }

  public static readonly _entityName = 'presets';
}
