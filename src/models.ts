import { Database } from "./database";
import { fields } from "./fields";
import type { PartialRecord } from "./types";

export type ModelConstructor = new () => Model;

class Manager<T extends Model, Y = Partial<Omit<T, "tableName" | "id">>> {
  model: typeof Model;

  constructor(model: new () => T) {
    this.model = model;
  }

  async all(): Promise<Y[]> {
    const db: Database = await Database.getInstance();
    return db.driver.getMany(db.getModelTableName(this.model), []) as Promise<
      Y[]
    >;
  }

  async filter(filters: PartialRecord<keyof Y, any>): Promise<Y[]> {
    const db: Database = await Database.getInstance();
    const dbFilters = db.filtersDictToDatabaseFilter(this.model, filters);
    return db.driver.getMany(
      db.getModelTableName(this.model),
      dbFilters
    ) as Promise<Y[]>;
  }

  async create(payload: PartialRecord<keyof Y, any>): Promise<Y> {
    const db: Database = await Database.getInstance();
    const dbValues = db.entryToDatabaseValue(this.model, payload);

    return db.driver.create(db.getModelTableName(this.model), [
      dbValues,
    ]) as Promise<Y>;
  }

  async delete(filters: PartialRecord<keyof Y, any> = {}) {
    const db: Database = await Database.getInstance();
    const dbFilters = db.filtersDictToDatabaseFilter(this.model, filters);
    return db.driver.delete(db.getModelTableName(this.model), dbFilters);
  }
}

function createManager<T extends Model>(model: new () => T) {
  return new Manager<T>(model);
}

class Model {
  tableName: string | undefined;

  id = fields.integerField({ primaryKey: true, autoIncrement: true });
}

export const models = {
  Model,
  createManager,
  ...fields,
};
