import StorageEntity from "$lib/extension/base/StorageEntity";

export interface TestedSettings {
  stringField: string;
  numberField: number;
  nested?: {
    field: boolean;
  };
}

export class TestedEntity extends StorageEntity<TestedSettings> {
  static readonly _entityName = "entity";

  constructor(id: string, settings: TestedSettings) {
    super(id, settings);
  }
}
