import { Database } from "../src/database";
import type { SQLiteDriver } from "../src/drivers/sqlite";
import { Book } from "./mocks/models";

const db = new Database({ driver: "sqlite", databaseUrl: "test.database.db" });

describe("Database Middleware Tests", () => {
  test("It creates model table", async () => {
    db.createModelTableIfNotExists(Book);

    const sqlite = db.driver as SQLiteDriver;

    const result = await sqlite.fetchOne(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='book';`
    );

    expect((result as Record<string, any>).name).toBe("book");

    const columns = (await sqlite.fetchMany(
      `PRAGMA table_info(book);`
    )) as Record<string, any>[];

    expect(columns[0].name).toBe("id");
    expect(columns[0].type).toBe("INTEGER");
    expect(columns[1].name).toBe("name");
    expect(columns[1].type).toBe("TEXT");
  });
});
