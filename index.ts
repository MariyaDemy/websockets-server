import { httpServer } from "./src/http_server/index.js";
import { wsServer } from "./src/ws_server/index.js";
import { HTTP_PORT, WS_PORT } from "./src/constants.js";

console.log(`Start static http server on the ${HTTP_PORT} port: http://localhost:${HTTP_PORT}`);

httpServer.listen(HTTP_PORT);
wsServer.listen(WS_PORT);
