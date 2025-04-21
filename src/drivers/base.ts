import type {
  DatabaseField,
  DatabaseFilter,
  DatabaseResult,
  Payload,
} from "./types";

export abstract class BaseDriver<T> {
  abstract connection: T;

  createTable(tableName: string, fields: DatabaseField<any>[]) {
    throw Error("Not Implemented");
  }

  getOne(
    tableName: string,
    filters: DatabaseFilter[]
  ): Promise<DatabaseResult> {
    throw Error("Not Implemented");
  }

  getMany(
    tableName: string,
    filters?: DatabaseFilter[]
  ): Promise<DatabaseResult[]> {
    throw Error("Not Implemented");
  }

  create(tableName: string, payload: Payload[]): Promise<DatabaseResult> {
    throw Error("Not Implemented");
  }

  update(tableName: string, filters: DatabaseFilter[], payload: Payload): void {
    throw Error("Not Implemented");
  }

  delete(tableName: string, filters: DatabaseFilter[]) {
    throw Error("Not Implemented");
  }
}
