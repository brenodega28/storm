import path from "path";
import type { BaseDriver } from "./drivers/base";
import { SQLiteDriver } from "./drivers/sqlite";
import type {
  DatabaseConfig,
  DatabaseField,
  DatabaseFilter,
  DatabaseFilterGroup,
  Payload,
} from "./drivers/types";
import type { Field } from "./fields";
import type { ModelConstructor } from "./models";
import { isGroupFilter } from "./query";
import type { Filter, FilterGrouping, PartialModel } from "./types";

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

  filterDictToDatabaseFilters<T>(
    model: ModelConstructor,
    filters: PartialModel<T>
  ): DatabaseFilter[] {
    const dbFilters = this.entryToDatabaseValue(model, filters);
    return Object.entries(dbFilters).map(([key, value]) => ({
      field: key,
      comparator: "=",
      value,
    }));
  }

  filterToDatabaseFilter<T>(
    model: ModelConstructor,
    filter: Filter<T>
  ): DatabaseFilterGroup {
    if (isGroupFilter(filter)) {
      return {
        operator: (filter as FilterGrouping<T>).operator,
        filters: (filter as FilterGrouping<T>).filters.map((f) =>
          this.filterToDatabaseFilter(model, f)
        ),
      };
    }

    return {
      operator: "and",
      filters: this.filterDictToDatabaseFilters(model, filter),
    };
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
