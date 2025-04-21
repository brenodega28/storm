import { Database } from "../src/database";

export const database = new Database({
  driver: "sqlite",
  databaseUrl: "test.mock.db",
});
