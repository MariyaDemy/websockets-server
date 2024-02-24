import { WebSocketServer } from 'ws';
import { WS_PORT } from '../constants.js';
import { database } from './Database.js';
import { wsMessageHandler } from './WSMessageHandler.js';

class websocketServer {
  constructor(){
    this.database = database;
    this.wsMessageHandler = wsMessageHandler;
  }

  listen(port){
    const wsServer = new WebSocketServer({
      port,
      clientTracking: true,
    },
    () => console.log(`Start WebSocket server on the ${WS_PORT} port: ws://localhost:${WS_PORT}`)
    );

   wsServer.on('connection', (ws) => {

      ws.id = Date.now();
      console.log(`WebSocket with id=${ws.id} connected`);

      ws.on('message', (data) => {
        data = JSON.parse(data.toString());
        const command = data.type;
        console.log('Command:', command);

        const response = this.wsMessageHandler.handleMessage(command, data.data);
        ws.send(JSON.stringify(response),
          () => console.log("Result:", response)
        );
      });

      ws.on('close', (err) => {
        console.log('closed', err)
        console.log(`WebSocket with id=${ws.id} disconnected`);
      });

      ws.on('error', () => {
        console.error(`Unknown error: WebSocket with id=${ws.id} disconnected`);
        ws.close();
      });

    });

    wsServer.on('error', function(){
      wsServer.clients.forEach(client => client.close());
    });

    return wsServer;
  }
}

const wsServer = new websocketServer();

export { wsServer };