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
import { Server, Socket } from 'socket.io';
import { UserJoinedLobbyDto } from './dtos/user-joined-lobby.dto';
import { UsersService } from 'src/auth/users.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/auth/user.entity';

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
    // console.log('after init');
  }

  handleConnection(@ConnectedSocket() client: any) {
    console.log('CLIENT CONNECTED');
  }

  handleDisconnect(@ConnectedSocket() client: any) {
    console.log('USER DISCONNECTED');
  }

  @SubscribeMessage('events')
  handleEvent(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): string {
    console.log('event arrived on BE', data);
    // console.log('client: ', client);
    // console.log(data, client);
    return data;
  }

  @SubscribeMessage('USER_JOINED_ROOM')
  handleUserJoinedRoom(@MessageBody() data: string) {}

  @SubscribeMessage('USER_JOINED_LOBBY')
  async handleUserJoinedLobby(@MessageBody() data: UserJoinedLobbyDto) {
    await this.usersService.addUserToLobby(data);
    this.server.emit('USER_JOINED_LOBBY', data);
  }
}
