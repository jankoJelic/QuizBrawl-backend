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
import { LobbiesService } from 'src/lobbies/lobbies.service';
import { UserJoinedLobbyDto } from './dtos/user-joined-lobby.dto';

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
  constructor(private readonly lobbiesService: LobbiesService) {}

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
  handleUserJoinedLobby(@MessageBody() data: UserJoinedLobbyDto) {
    this.server.emit('USER_JOINED_LOBBY', data);
    this.lobbiesService.addUserToLobby(data);
  }
}
