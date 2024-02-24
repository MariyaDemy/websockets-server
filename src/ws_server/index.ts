import { WebSocketServer } from 'ws';
import { WS_PORT } from '../constants.ts';
import { database } from './Database.ts';
import { wsMessageHandler } from './WSMessageHandler.ts';
import { CustomWebSocket, RequestMessage, ResponseMessage } from './types.ts';

class websocketServer {
  database: typeof database;
  wsMessageHandler: typeof wsMessageHandler;
  constructor() {
    this.database = database;
    this.wsMessageHandler = wsMessageHandler;
  }

  listen(port: number) {
    const wsServer = new WebSocketServer(
      {
        port,
        clientTracking: true,
      },
      () =>
        console.log(
          `Start WebSocket server on the ${WS_PORT} port: ws://localhost:${WS_PORT}`,
        ),
    );

    wsServer.on('connection', (ws) => {
      const customWS = ws as unknown as CustomWebSocket;
      customWS.id = Date.now();
      console.log(`WebSocket with id=${customWS.id} connected`);

      ws.on('message', (data) => {
        const message: RequestMessage = JSON.parse(data.toString());
        const command = message.type;
        console.log('Command:', command);

        const response: ResponseMessage = this.wsMessageHandler.handleMessage(
          command,
          message.data,
        );
        ws.send(JSON.stringify(response), () =>
          console.log('Result:', response),
        );
      });

      ws.on('close', () => {
        console.log(`WebSocket with id=${customWS.id} disconnected`);
      });

      ws.on('error', () => {
        console.error(
          `Unknown error: WebSocket with id=${customWS.id} disconnected`,
        );
        ws.close();
      });
    });

    wsServer.on('error', function () {
      wsServer.clients.forEach((client) => client.close());
    });

    return wsServer;
  }
}

const wsServer = new websocketServer();

export { wsServer };
