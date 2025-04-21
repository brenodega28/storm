import type { FilterOperator } from "./drivers/types";

export type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T;
};

export type PartialModel<T> = PartialRecord<keyof T, any>;

export interface FilterGrouping<T> {
  filters: (PartialModel<T> | FilterGrouping<T>)[];
  operator: FilterOperator;
}

export type Filter<T> = FilterGrouping<T> | PartialModel<T>;
