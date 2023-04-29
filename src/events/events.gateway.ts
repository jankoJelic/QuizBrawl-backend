import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { UserJoinedLobbyDto } from './dtos/user-joined-lobby.dto';
import { UsersService } from 'src/auth/users.service';
import { UserJoinedRoomDto } from './dtos/user-joined-room.dto';
import { SOCKET_EVENTS } from './constants/events';

@WebSocketGateway({
  namespace: 'events',
  transports: ['websocket'],
  cors: {
    origin: '*',
  },
})
export class EventsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(private readonly usersService: UsersService) {}

  @WebSocketServer()
  public server: Server;

  afterInit(server: any) {
    console.log('after init');
  }

  handleConnection(@ConnectedSocket() client: any) {
    console.log('CLIENT CONNECTED');
  }

  handleDisconnect(@ConnectedSocket() client: any) {
    console.log('USER DISCONNECTED');
  }

  @SubscribeMessage(SOCKET_EVENTS.USER_JOINED_LOBBY)
  async handleUserJoinedLobby(@MessageBody() data: UserJoinedLobbyDto) {
    await this.usersService.addUserToLobby(data);
    this.server.emit(SOCKET_EVENTS.USER_JOINED_LOBBY, data);
  }

  @SubscribeMessage(SOCKET_EVENTS.USER_LEFT_LOBBY)
  async handleUserLeftLobby(@MessageBody() data: UserJoinedLobbyDto) {}

  @SubscribeMessage(SOCKET_EVENTS.USER_JOINED_ROOM)
  async handleUserJoinedRoom(@MessageBody() data: UserJoinedRoomDto) {}
}
