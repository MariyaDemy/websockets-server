import { database } from './Database.ts';
import { ResponseMessage, RequestCommand, LoginUserData } from './types.ts';

class WSMessageHandler {
  database: typeof database;
  constructor() {
    this.database = database;
  }

  handleMessage(command: RequestCommand, data: string) {
    const message = JSON.parse(data);
    const defaultResponse: ResponseMessage = {
      type: 'Unknown command',
      data: {},
      id: 0,
    };
    switch (command) {
      case 'reg':
        return this.loginUser(message);
    }
    return defaultResponse;
  }

  loginUser(data: LoginUserData) {
    let user = this.database.getUser(data.name);
    if (!user) {
      user = this.database.createUser(data);
    }

    const response: ResponseMessage = {
      type: 'reg',
      id: 0,
      data: {},
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
}

const wsMessageHandler = new WSMessageHandler();

export { wsMessageHandler };
