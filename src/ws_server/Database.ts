import { User, LoginUserData, Room, Winner } from './types.ts';

class Database {
  users = new Map<number, User>();
  rooms = new Map<number, Room>();
  winners = new Map<string, Winner>();

  constructor() {}

  getWebSocketIdByName(name: string) {
    for (const [wsId, value] of this.users.entries()) {
      if (value.name === name) {
        return wsId;
      }
    }
  }

  getUsers() {
    return Array.from(this.users.entries());
  }

  getUser(name: string, wsId: number) {
    const oldWSId = this.getWebSocketIdByName(name);
    if (oldWSId) {
      const userData = this.users.get(oldWSId) as User;
      this.users.delete(oldWSId);
      this.users.set(wsId, userData);
    }
    return this.users.get(wsId);
  }

  getRoom(userId: number) {
    return this.rooms.get(userId);
  }

  getRooms() {
    return Array.from(this.rooms.values());
  }

  getWinners() {
    return Array.from(this.winners.values());
  }

  createUser({ name, password }: LoginUserData, wsId: number) {
    name = name.trim();
    this.users.set(wsId, {
      id: this.users.size + 1,
      name,
      password,
    });
    return this.getUser(name, wsId);
  }

  createRoom(wsId: number) {
    const { name, id: userId } = this.users.get(wsId) as User;
    //check if there is no room for this user yet: one user = one room
    const roomExists = this.getRoom(userId);
    if (!roomExists) {
      this.rooms.set(userId, {
        roomId: this.rooms.size + 1,
        roomUsers: [
          {
            name,
            index: userId,
          },
        ],
      });
    }
  }
}

const database = new Database();

export { database };
