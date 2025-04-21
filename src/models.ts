import { Database } from "./database";
import { fields } from "./fields";
import type { Filter, PartialModel } from "./types";

export type ModelConstructor = new () => Model;

class Manager<T extends Model, Y = Partial<Omit<T, "tableName" | "id">>> {
  model: typeof Model;

  constructor(model: new () => T) {
    this.model = model;
  }

  async all(): Promise<Y[]> {
    const db: Database = await Database.getInstance();
    return db.driver.getMany(db.getModelTableName(this.model), {
      filters: [],
      operator: "and",
    }) as Promise<Y[]>;
  }

  async filter(filter: Filter<Y>): Promise<Y[]> {
    const db: Database = await Database.getInstance();
    const dbFilters = db.filterToDatabaseFilter(this.model, filter);

    return db.driver.getMany(
      db.getModelTableName(this.model),
      dbFilters
    ) as Promise<Y[]>;
  }

  async create(payload: PartialModel<Y>): Promise<Y> {
    const db: Database = await Database.getInstance();
    const dbValues = db.entryToDatabaseValue(this.model, payload);

    return db.driver.create(db.getModelTableName(this.model), [
      dbValues,
    ]) as Promise<Y>;
  }

  async delete(filters: PartialModel<Y> = {}) {
    const db: Database = await Database.getInstance();
    const dbFilters = db.filterToDatabaseFilter(this.model, filters);
    return db.driver.delete(db.getModelTableName(this.model), dbFilters);
  }
}

function createManager<T extends Model>(model: new () => T) {
  return new Manager<T>(model);
}

class Model {
  [key: string]: any;

  tableName: string | undefined;

  id = fields.integerField({ primaryKey: true, autoIncrement: true });

  static new(data: PartialModel<typeof this> = {}) {
    const cls = new this();
    Object.entries(data).forEach(([key, value]) => {
      cls[key] = value;
      console.log(key, cls[key]);
    });

    return cls;
  }
}

export const models = {
  Model,
  createManager,
  ...fields,
};
