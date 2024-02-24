interface User {
  id: number;
  name: string;
  password: string;
}

interface CustomWebSocket extends WebSocket {
  id: number;
}

type RequestCommand =
  | 'reg'
  | 'create_room'
  | 'add_user_to_room'
  | 'add_ships'
  | 'attack'
  | 'randomAttack';

type ResponseCommand =
  | 'reg'
  | 'update_winners'
  | 'create_game'
  | 'update_room'
  | 'start_game'
  | 'attack'
  | 'turn'
  | 'finish'
  | 'Unknown command';

type Position = { x: number; y: number };

interface Ship {
  position: Position;
  direction: boolean;
  length: number;
  type: 'small' | 'medium' | 'large' | 'huge';
}

interface RequestMessageData {
  name?: string;
  password?: string;
  indexRoom?: number;
  gameId?: number;
  ships?: Ship[];
  indexPlayer?: number;
  x?: number;
  y?: number;
}

interface ResponseMessageData {
  name?: string;
  index?: number;
  error?: boolean;
  errorText?: string;
  wins?: number;
  idGame?: number;
  idPlayer?: number;
  ships?: Ship[];
  currentPlayerIndex?: number;
  position?: Position;
  currentPlayer?: number;
  status?: 'miss' | 'killed' | 'shot';
  winPlayer?: number;
}

type RoomUser = {
  name: string;
  index: number;
};

type Room = {
  roomId: number;
  roomUsers: RoomUser[];
};

interface RequestMessage {
  type: RequestCommand;
  data: string;
  id: 0;
}

interface ResponseMessage {
  type: ResponseCommand;
  data: ResponseMessageData | Room[] | string;
  id: 0;
}

interface LoginUserData {
  name: string;
  password: string;
}

export {
  User,
  CustomWebSocket,
  RequestMessage,
  ResponseMessage,
  RequestCommand,
  RequestMessageData,
  LoginUserData,
};
