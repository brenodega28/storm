import { and, or } from "../src/query";
import { database } from "./database";
import { User } from "./mocks/models";

describe("Model tests", () => {
  describe("Manager tests", () => {
    beforeAll(async () => {
      database.createModelTableIfNotExists(User);
      database.driver.delete("user", { filters: [] });
    });

    test("It creates entries", async () => {
      const renan = await User.objects.create({ name: "Renan", age: 26 });
      const ana = await User.objects.create({ name: "Ana", age: 27 });

      expect(renan.name).toBe("Renan");
      expect(ana.age).toBe(27);
    });

    test("It lists entries", async () => {
      const users = await User.objects.all();

      expect(users.length).toBe(2);
      expect(users[0].name).toBe("Renan");
    });

    test("It filters entries", async () => {
      const users = await User.objects.filter({ name: "Renan", age: 26 });

      expect(users.length).toBe(1);
      expect(users[0].name).toBe("Renan");
    });

    test("It deletes entry", async () => {
      await User.objects.delete({ name: "Renan" });
      const users = await User.objects.all();

      expect(users.length).toBe(1);
      expect(users[0].name).toBe("Ana");
    });
  });

  describe("Filter tests", () => {
    beforeAll(async () => {
      database.createModelTableIfNotExists(User);
      database.driver.delete("user", { filters: [] });

      await User.objects.create({ name: "Renan", age: 26 });
      await User.objects.create({ name: "Ana", age: 27 });
    });

    test("It filters with OR", async () => {
      const result = await User.objects.filter(
        or({ name: "Renan" }, { age: 27 })
      );

      expect(result.length).toBe(2);
    });

    test("It filters with AND", async () => {
      const result = await User.objects.filter(
        or(and({ name: "Renan" }, { age: 25 }), { age: 27 })
      );

      expect(result.length).toBe(1);
    });
  });
});
