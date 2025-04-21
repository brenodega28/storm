//@ts-expect-error path exists lol
import path from "path";
import type { BaseDriver } from "./drivers/base";
import { SQLiteDriver } from "./drivers/sqlite";
import type {
  DatabaseConfig,
  DatabaseField,
  DatabaseFilter,
  Payload,
} from "./drivers/types";
import type { Field } from "./fields";
import type { ModelConstructor } from "./models";

export class Database {
  driver: BaseDriver<any>;

  constructor(config: DatabaseConfig) {
    this.driver = this.getDriver(config);
  }

  private getDriver(config: DatabaseConfig): BaseDriver<any> {
    switch (config.driver) {
      case "sqlite":
        return new SQLiteDriver(config);
    }
  }

  getModelTableName(model: ModelConstructor) {
    return model.name.toLowerCase();
  }

  modelToDatabaseFields(model: ModelConstructor): DatabaseField<any>[] {
    const instance = new model();

    return Object.getOwnPropertyNames(instance)
      .filter((key) => {
        const property = instance[key as keyof typeof instance];

        if (!property || typeof property == "string") return false;

        return property?.type;
      })
      .map((key) => {
        const field = instance[key as keyof typeof instance] as Field<any, any>;

        return {
          name: key,
          type: field.type,
          constraints: field.constraints,
          parser: field.parser,
        };
      });
  }

  entryToDatabaseValue(
    model: ModelConstructor,
    payload: Payload
  ): Record<string, any> {
    const instance = new model();
    const databaseFields = this.modelToDatabaseFields(model);

    return Object.fromEntries(
      databaseFields
        .filter((f) => f.name in payload)
        .map((f) => [f.name, f.parser(payload[f.name])])
    );
  }

  filtersDictToDatabaseFilter(
    model: ModelConstructor,
    filters: Record<string, any>
  ): DatabaseFilter[] {
    const dbFilters = this.entryToDatabaseValue(model, filters);
    return Object.entries(dbFilters).map(([key, value]) => ({
      field: key,
      comparator: "=",
      value,
    }));
  }

  async createModelTableIfNotExists(model: ModelConstructor) {
    await this.driver.createTable(
      this.getModelTableName(model),
      this.modelToDatabaseFields(model)
    );
  }

  static async getInstance() {
    const { database } = await import(
      //@ts-expect-error require exists lol
      path.resolve(path.dirname(require.main.filename) + "/database.ts")
    );

    return database;
  }
}
