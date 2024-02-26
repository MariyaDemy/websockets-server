import { database } from './Database.ts';
import {
  ResponseMessage,
  RequestCommand,
  LoginUserData,
  addUserToRoomData,
  User,
  RoomUser,
  Room,
  CustomWebSocket,
} from './types.ts';

class WSMessageHandler {
  database: typeof database;
  constructor() {
    this.database = database;
  }

  handleMessage(
    command: RequestCommand,
    data: string,
    wsId: number,
    wsConnections: Set<CustomWebSocket>,
  ): ResponseMessage[] {
    if (data === '') data = '""'; //to JSON.parse not fail
    const message = JSON.parse(data);
    const defaultResponse: ResponseMessage = {
      type: 'Unknown command',
      data: '',
      id: 0,
    };
    switch (command) {
      case 'reg':
        return [
          this.loginUser(message, wsId),
          this.updateRoom(),
          this.updateWinners(),
        ];
      case 'create_room':
        this.createRoom(wsId);
        return [this.updateRoom()];
      case 'add_user_to_room':
        return this.addUserToRoom(message, wsId, wsConnections);
    }
    return [defaultResponse];
  }

  loginUser(data: LoginUserData, wsId: number): ResponseMessage {
    let user = this.database.getUser(data.name, wsId);
    if (!user) {
      user = this.database.createUser(data, wsId);
    }

    const response: ResponseMessage = {
      type: 'reg',
      data: {},
      id: 0,
    };

    response.data = {
      name: user?.name,
      index: user?.index,
      error: false,
      errorText: '',
    };

    try {
      if (user?.password !== data.password) {
        throw new Error('Your password is incorrect. Try again');
      }
    } catch (error) {
      if (error instanceof Error) {
        response.data = {
          ...response.data,
          error: true,
          errorText: error.message,
        };
      }
    }

    response.data = JSON.stringify(response.data);
    return response;
  }

  updateRoom(): ResponseMessage {
    const response: ResponseMessage = {
      type: 'update_room',
      data: this.database.getRooms(),
      id: 0,
    };

    response.data = JSON.stringify(response.data);
    return response;
  }

  createRoom(wsId: number) {
    this.database.createRoom(wsId);
  }

  updateWinners(): ResponseMessage {
    const response: ResponseMessage = {
      type: 'update_winners',
      data: this.database.getWinners(),
      id: 0,
    };

    response.data = JSON.stringify(response.data);
    return response;
  }

  addUserToRoom(
    { indexRoom }: addUserToRoomData,
    wsId: number,
    wsConnections: Set<CustomWebSocket>,
  ): ResponseMessage[] {
    const { name, index: userId } = this.database.users.get(wsId) as User;
    const room = this.database.getRoomByRoomId(indexRoom) as Room;
    if (room?.roomUsers[0].index !== userId) {
      const user: RoomUser = { name, index: userId };
      this.database.addUserToRoom(indexRoom, user);
      this.createGame(room, wsConnections);
      return [this.updateRoom()];
    }
    return [this.updateRoom()];
  }

  createGame(room: Room, WSConnections: Set<CustomWebSocket>) {
    const response: ResponseMessage = {
      type: 'create_game',
      data: {},
      id: 0,
    };

    const game = this.database.createGame(room);
    if (!game) return response;
    //user who has sent add_user_to_room request is always added second to the game
    const player1Id = game.players[1].index;
    const player2Id = game.players[0].index;
    const player1WebSocketId = this.database.getWebSocketIdByName(
      game.players[1].name,
    );
    const player2WebSocketId = this.database.getWebSocketIdByName(
      game.players[0].name,
    );

    const response4Player1 = Object.assign({}, response);
    response4Player1.data = {
      idGame: game.idGame,
      idPlayer: player1Id,
    };
    response4Player1.data = JSON.stringify(response4Player1.data);

    const response4Player2 = Object.assign({}, response);
    response4Player2.data = {
      idGame: game.idGame,
      idPlayer: player2Id,
    };
    response4Player2.data = JSON.stringify(response4Player2.data);

    WSConnections.forEach((socket) => {
      if (socket.id === player1WebSocketId) {
        socket.send(JSON.stringify(response4Player1), () => {
          console.log('Result:', response4Player1);
        });
      }
      if (socket.id === player2WebSocketId) {
        socket.send(JSON.stringify(response4Player2), () => {
          console.log('Result:', response4Player2);
        });
      }
    });
  }
}

const wsMessageHandler = new WSMessageHandler();

export { wsMessageHandler };
