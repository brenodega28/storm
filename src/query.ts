import type { Database } from "./database";
import type { DatabaseFilter } from "./drivers/types";
import type { Filter, FilterGrouping } from "./types";

enum QuerySetOperation {
  SELECT,
  UPDATE,
  DELETE,
}

export class QuerySet {
  database: Database;
  filters: DatabaseFilter[] = [];
  operation: QuerySetOperation = QuerySetOperation.SELECT;

  constructor(database: Database) {
    this.database = database;
  }
}

export function or(...filters: Filter<any>[]): FilterGrouping<any> {
  return {
    filters,
    operator: "or",
  };
}

export function and(...filters: Filter<any>[]): FilterGrouping<any> {
  return {
    filters,
    operator: "and",
  };
}

export function isGroupFilter<T>(filter: Filter<T>): boolean {
  return "operator" in filter;
}
