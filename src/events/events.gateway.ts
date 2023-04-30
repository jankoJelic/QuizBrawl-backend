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
import { Room } from 'src/rooms/room.entity';

const {
  ROOM_CREATED,
  ROOM_DELETED,
  USER_JOINED_LOBBY,
  USER_JOINED_ROOM,
  USER_LEFT_LOBBY,
  USER_LEFT_ROOM,
} = SOCKET_EVENTS;

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

  afterInit(server: any) {}

  handleConnection(@ConnectedSocket() client: any) {}

  async handleDisconnect(@ConnectedSocket() client: any) {
    const { userId } = client.handshake.query || {};
    const user = await this.usersService.findOne(userId);

    if (!!user?.lobby?.id) {
      this.server.emit(USER_LEFT_LOBBY);
      this.usersService.removeUserFromLobby(user);
    }

    if (!!user?.room?.id) {
      this.server.emit(USER_LEFT_ROOM);
      this.usersService.removeUserFromRoom(user);
    }
  }

  @SubscribeMessage(USER_JOINED_LOBBY)
  async handleUserJoinedLobby(@MessageBody() data: UserJoinedLobbyDto) {
    await this.usersService.addUserToLobby(data);
    this.server.emit(USER_JOINED_LOBBY, data);
  }

  @SubscribeMessage(USER_LEFT_LOBBY)
  async handleUserLeftLobby(@MessageBody() data: UserJoinedLobbyDto) {
    this.server.emit(USER_LEFT_LOBBY, data);
  }

  @SubscribeMessage(USER_JOINED_ROOM)
  async handleUserJoinedRoom(@MessageBody() data: UserJoinedRoomDto) {
    this.server.emit(USER_JOINED_ROOM, data);
  }

  @SubscribeMessage(ROOM_CREATED)
  async handleRoomCreated(@MessageBody() room: Room) {
    this.server.emit(ROOM_CREATED, room);
  }

  @SubscribeMessage(ROOM_DELETED)
  async handleRoomDeleted(@MessageBody() room: Room) {
    this.server.emit(ROOM_DELETED, room);
  }
}
