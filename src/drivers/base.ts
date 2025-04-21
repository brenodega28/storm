import type {
  DatabaseField,
  DatabaseFilterGroup,
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
    filters: DatabaseFilterGroup
  ): Promise<DatabaseResult> {
    throw Error("Not Implemented");
  }

  getMany(
    tableName: string,
    filters: DatabaseFilterGroup
  ): Promise<DatabaseResult[]> {
    throw Error("Not Implemented");
  }

  create(tableName: string, payload: Payload[]): Promise<DatabaseResult> {
    throw Error("Not Implemented");
  }

  update(
    tableName: string,
    filters: DatabaseFilterGroup,
    payload: Payload
  ): void {
    throw Error("Not Implemented");
  }

  delete(tableName: string, filters: DatabaseFilterGroup) {
    throw Error("Not Implemented");
  }
}
