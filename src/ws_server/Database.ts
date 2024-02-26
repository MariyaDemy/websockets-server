import {
  User,
  LoginUserData,
  Room,
  Winner,
  RoomUser,
  Game,
  Player,
} from './types.ts';

class Database {
  users = new Map<number, User>();
  rooms = new Map<number, Room>();
  games = new Map<number, Game>();
  players = new Map<number, Player>();
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

  getRoomByUserId(userId: number) {
    return this.rooms.get(userId);
  }

  getRoomKeyByRoomId(roomId: number) {
    for (const [key, room] of this.rooms.entries()) {
      if (room.roomId === roomId) {
        return key;
      }
    }
  }

  getRoomByRoomId(roomId: number) {
    const userId = this.getRoomKeyByRoomId(roomId);
    if (userId) {
      return this.getRoomByUserId(userId);
    }
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
      index: this.users.size + 1,
      name,
      password,
    });
    return this.getUser(name, wsId);
  }

  createRoom(wsId: number) {
    const { name, index: userId } = this.users.get(wsId) as User;
    //check if there is no room for this user yet: one user = one room
    const roomExists = this.getRoomByUserId(userId);
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

  addUserToRoom(indexRoom: number, user: RoomUser) {
    const room = this.getRoomByRoomId(indexRoom);
    const roomKey = this.getRoomKeyByRoomId(indexRoom);
    if (room && roomKey) {
      room.roomUsers.push(user);
      this.rooms.delete(roomKey);
    }
  }

  getGames() {
    return Array.from(this.games.values());
  }

  getGame(roomId: number) {
    return this.games.get(roomId);
  }

  createGame({ roomId, roomUsers }: Room) {
    this.games.set(roomId, {
      idGame: this.games.size + 1,
      players: [...roomUsers],
    });
    return this.getGame(roomId);
  }
}

const database = new Database();

export { database };
