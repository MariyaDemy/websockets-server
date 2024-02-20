import { httpServer } from "./src/http_server/index.js";
import { websocketServer } from "./src/ws_server/index.js";
import { HTTP_PORT, WS_PORT } from "./src/constants.js";

const wsServer = new websocketServer();

httpServer.listen(HTTP_PORT);
wsServer.listen(WS_PORT);

