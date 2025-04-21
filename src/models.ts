import { Database } from "./database";
import { fields } from "./fields";
import type { Filter, PartialModel } from "./types";

export type ModelConstructor = new () => Model;

class Manager<T extends Model, Y = Partial<Omit<T, "tableName" | "id">>> {
  model: new () => Model;

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

  async delete(filters: PartialModel<Y> = {} as PartialModel<Y>) {
    const db: Database = await Database.getInstance();
    const dbFilters = db.filterToDatabaseFilter(this.model, filters);
    return db.driver.delete(db.getModelTableName(this.model), dbFilters);
  }
}

function createManager<T extends Model>(model: new () => T) {
  return new Manager<T>(model);
}

class Model {
  tableName: string | undefined;

  id = fields.integerField({ primaryKey: true, autoIncrement: true });

  static objects = createManager(this);

  static getFields(): string[] {
    const instance = new this();
    return Object.getOwnPropertyNames(instance).filter((key) => {
      const property = instance[key as keyof typeof instance];

      if (!property || typeof property == "string") return false;

      return "type" in property;
    });
  }

  create() {
    const staticFuncs: typeof Model = this.constructor as typeof Model;
    const fields = staticFuncs.getFields();
    const payload = Object.fromEntries(
      fields.filter((f) => f !== "id").map((f) => [f, this[f as keyof Model]])
    );

    const instance = staticFuncs.objects.create(payload);

    Object.entries(instance).map(([key, value]) => {
      this[key as keyof Model] = value;
    });

    return this;
  }
}

function create<T extends Model>(model: new () => T, data: PartialModel<T>) {
  const instance = new model();

  //@ts-expect-error
  model.getFields().forEach((field: string) => {
    //@ts-expect-error
    instance[field as keyof Model] = null;
  });

  Object.entries(data).forEach(([key, value]) => {
    instance[key as keyof T] = value;
  });

  return instance;
}

export const models = {
  Model,
  createManager,
  create,
  ...fields,
};
