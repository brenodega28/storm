import { Database } from "../../src/database";
import type { SQLiteDriver } from "../../src/drivers/sqlite";
import { User } from "../mocks/models";

const db = new Database({ driver: "sqlite", databaseUrl: "test.sqlite.db" });

describe("SQLite Tests", () => {
  test("It creates table", async () => {
    const sqlite = db.driver as SQLiteDriver;
    db.driver.createTable("user", db.modelToDatabaseFields(User));

    const result = await sqlite.fetchOne(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='user';`
    );

    expect((result as Record<string, any>).name).toBe("user");

    const columns = (await sqlite.fetchMany(
      `PRAGMA table_info(user);`
    )) as Record<string, any>[];

    expect(columns[0].name).toBe("id");
    expect(columns[0].type).toBe("INTEGER");
    expect(columns[1].name).toBe("name");
    expect(columns[1].type).toBe("TEXT");
    expect(columns[2].name).toBe("age");
    expect(columns[2].type).toBe("INTEGER");
  });

  test("It creates a user", async () => {
    db.driver.create("user", [
      { name: "'Breno'", age: 27 },
      { name: "'Ana'", age: 27 },
    ]);

    const result = await db.driver.getMany("user", { filters: [] });

    expect(result[0].name).toBe("Breno");
    expect(result[1].name).toBe("Ana");
  });

  test("It gets users", async () => {
    const result = await db.driver.getMany("user", { filters: [] });

    expect(result[0].name).toBe("Breno");
    expect(result[1].name).toBe("Ana");
  });

  test("It gets Ana", async () => {
    const result = await db.driver.getOne("user", {
      filters: [{ field: "name", comparator: "=", value: "'Ana'" }],
    });

    expect(result.name).toBe("Ana");
  });

  test("It updates Ana age", async () => {
    await db.driver.update(
      "user",
      {
        filters: [{ field: "name", comparator: "=", value: "'Ana'" }],
      },
      { age: 1 }
    );
    const ana = await db.driver.getOne("user", {
      filters: [{ field: "name", comparator: "=", value: "'Ana'" }],
    });

    expect(ana.age).toBe(1);
  });

  test("It updates all ages", async () => {
    await db.driver.update("user", { filters: [] }, { age: 2 });
    const result = await db.driver.getMany("user", { filters: [] });

    expect(result[0].age).toBe(2);
    expect(result[1].age).toBe(2);
  });

  test("It deletes Ana", async () => {
    await db.driver.delete("user", {
      filters: [{ field: "name", comparator: "=", value: "'Ana'" }],
    });
    const result = await db.driver.getMany("user", { filters: [] });

    expect(result.length).toBe(1);
    expect(result[0].name).toBe("Breno");
  });
});
