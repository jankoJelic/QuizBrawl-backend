import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class RoomGateway {
  constructor() {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('room')
  handleMessage(client, data) {
    // this.server.emit();
  }
}
