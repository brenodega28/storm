import type { FieldConstraints, FieldTypes } from "./drivers/types";

export interface Field<T, Y> {
  type: FieldTypes;
  constraints?: FieldConstraints;
  options?: T;
  parser: (value: any) => Y;
}

function integerField(constraints: FieldConstraints = {}): Field<null, number> {
  return {
    type: "integer",
    constraints,
    parser: (value) => value,
  };
}

interface CharFieldProps {
  maxLength: number;
}

function charField(
  constraints: FieldConstraints & CharFieldProps
): Field<CharFieldProps, string> {
  return {
    type: "string",
    constraints,
    parser: (value) => `'${value}'`,
  };
}

export const fields = {
  charField,
  integerField,
};
