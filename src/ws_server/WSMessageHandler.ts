import { database } from './Database.ts';
import { ResponseMessage, RequestCommand, LoginUserData } from './types.ts';

class WSMessageHandler {
  database: typeof database;
  constructor() {
    this.database = database;
  }

  handleMessage(
    command: RequestCommand,
    data: string,
    wsId: number,
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
      index: user?.id,
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
}

const wsMessageHandler = new WSMessageHandler();

export { wsMessageHandler };
