import { User, LoginUserData } from './types.ts';

class Database {
  users = new Map<string, User>();

  constructor() {}

  getUser(name: string) {
    name = name.trim();
    return this.users.get(name);
  }

  createUser({ name, password }: LoginUserData) {
    name = name.trim();
    this.users.set(name, {
      id: this.users.size + 1,
      name,
      password,
    });
    return this.getUser(name);
  }
}

const database = new Database();

export { database };
