import { models } from "../../src/models";

export class User extends models.Model {
  static objects = models.createManager(User);

  name = models.charField({ maxLength: 255, notNull: true });
  age = models.integerField({ notNull: true });
}

export class Book extends models.Model {
  static objects = models.createManager(Book);

  name = models.charField({ maxLength: 255, notNull: true });
}
