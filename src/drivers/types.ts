export type DatabaseResult = Record<string, any>;
export type Payload = Record<string, any>;
export type FieldTypes =
  | "string"
  | "integer"
  | "float"
  | "date"
  | "datetime"
  | "boolean";
export type SupportedDrivers = "sqlite";
export type FilterComparators = "=" | "is" | "ilike" | "like";

export interface DatabaseFilter {
  field: string;
  comparator: FilterComparators;
  value: any;
}

export interface FieldConstraints {
  notNull?: boolean;
  unique?: boolean;
  primaryKey?: boolean;
  autoIncrement?: boolean;
}

export interface DatabaseField<T> {
  type: FieldTypes;
  name: string;
  constraints?: FieldConstraints;
  parser: (value: any) => T;
}

export interface DatabaseRelation {
  fromField: string;
  toField: string;
  toTable: string;
}

export interface DatabaseConfig {
  databaseUrl: string;
  driver: SupportedDrivers;
}
