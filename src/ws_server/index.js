import { WebSocketServer } from 'ws';

class websocketServer {
  constructor(database){
    this.database = database;
  }

  listen(port){
    return new WebSocketServer({
      port,
    });
  }
}

export { websocketServer };