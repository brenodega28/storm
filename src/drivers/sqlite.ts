import { Database } from "sqlite3";
import { BaseDriver } from "./base";
import type {
  DatabaseConfig,
  DatabaseField,
  DatabaseFilter,
  DatabaseFilterGroup,
  DatabaseResult,
  FieldConstraints,
  FieldTypes,
  Payload,
} from "./types";

export class SQLiteDriver extends BaseDriver<Database> {
  connection: Database;

  constructor(config: DatabaseConfig) {
    super();
    this.connection = new Database(config.databaseUrl);
  }

  async fetchOne(sql: string, params: any[] = []): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this.connection.get(sql, params, (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  }

  async fetchMany(sql: string, params: any[] = []): Promise<unknown[]> {
    return new Promise((resolve, reject) => {
      this.connection.all(sql, params, (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }

  toDatabaseConstraints(constraints: FieldConstraints) {
    const databaseConstraints = [];

    if (constraints.notNull) databaseConstraints.push("NOT NULL");
    if (constraints.primaryKey) databaseConstraints.push("PRIMARY KEY");
    if (constraints.unique) databaseConstraints.push("UNIQUE");

    return databaseConstraints.join(" ");
  }

  toDatabaseWhere(filters: DatabaseFilterGroup): string {
    if (filters.filters.length === 0) return "";
    const filterStr = filters.filters
      .map((f) => {
        if ("operator" in f) return this.toDatabaseWhere(f);

        return `${(f as DatabaseFilter).field} ${
          (f as DatabaseFilter).comparator
        } ${(f as DatabaseFilter).value}`;
      })
      .join(` ${filters.operator || "and"} `.toUpperCase());

    if (filters.filters.length > 1) return `(${filterStr})`;

    return filterStr;
  }

  toDatabaseType(type: FieldTypes): string {
    switch (type) {
      case "string":
        return "TEXT";
      case "boolean":
        return "INTEGER";
      case "date":
        return "TEXT";
      case "datetime":
        return "TEXT";
      case "integer":
        return "INTEGER";
      case "float":
        return "REAL";
    }
  }

  createTable(tableName: string, fields: DatabaseField<any>[]) {
    const preparedFields = fields
      .map(
        (f) =>
          `${f.name} ${this.toDatabaseType(
            f.type
          )} ${this.toDatabaseConstraints(f.constraints || {})}`
      )
      .join(",\n");

    this.connection.exec(`
      CREATE TABLE IF NOT EXISTS ${tableName}(
        ${preparedFields}
      )
      `);
  }

  create(tableName: string, payload: Payload[]): Promise<DatabaseResult> {
    const fields = Object.keys(payload[0]).join(",");
    const values = payload
      .map((p) => "(" + Object.values(p).join(",") + ")")
      .join(",");

    return this.fetchOne(
      `INSERT INTO ${tableName}(${fields}) VALUES ${values} RETURNING *`
    ) as Promise<DatabaseResult>;
  }

  getOne(
    tableName: string,
    filters: DatabaseFilterGroup
  ): Promise<DatabaseResult> {
    const where = this.toDatabaseWhere(filters);
    return this.fetchOne(
      `SELECT * FROM ${tableName}${where.length > 0 ? " WHERE " + where : ""}`
    ) as Promise<DatabaseResult>;
  }

  getMany(
    tableName: string,
    filters: DatabaseFilterGroup
  ): Promise<DatabaseResult[]> {
    const where = this.toDatabaseWhere(filters);
    return this.fetchMany(
      `SELECT * FROM ${tableName}${where.length > 0 ? " WHERE " + where : ""}`
    ) as Promise<DatabaseResult[]>;
  }

  update(
    tableName: string,
    filters: DatabaseFilterGroup,
    payload: Payload
  ): void {
    if (Object.keys(payload).length == 0) return;

    const updates = Object.entries(payload)
      .map(([key, value]) => `${key} = ${value}`)
      .join(",");
    const where = this.toDatabaseWhere(filters);

    this.connection.exec(
      `UPDATE ${tableName} SET ${updates}${
        where.length > 0 ? " WHERE " + where : ""
      }`
    );
  }

  delete(tableName: string, filters: DatabaseFilterGroup): void {
    const where = this.toDatabaseWhere(filters);
    this.connection.exec(
      `DELETE FROM ${tableName}${where.length > 0 ? " WHERE " + where : ""}`
    );
  }
}
