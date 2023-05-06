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
import { UserJoinedRoomDto } from './dtos/user-joined-room.dto';
import { SOCKET_EVENTS } from './constants/events';
import { Room } from 'src/rooms/room.entity';
import { RoomsService } from 'src/rooms/rooms.service';
import { QuestionsService } from 'src/questions/questions.service';

const {
  ROOM_CREATED,
  ROOM_DELETED,
  USER_JOINED_LOBBY,
  USER_JOINED_ROOM,
  USER_LEFT_LOBBY,
  USER_LEFT_ROOM,
  GAME_STARTED,
  // USER_DISCONNECTED, // we will see if this one is needed
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
  constructor(
    private readonly usersService: UsersService,
    private roomsService: RoomsService,
    private questionsService: QuestionsService,
  ) {}

  @WebSocketServer()
  public server: Server;

  afterInit(server: any) {}

  handleConnection(@ConnectedSocket() client: any) {}

  async handleDisconnect(@ConnectedSocket() client: any) {
    const { userId } = client.handshake.query || {};
    this.usersService.updateUser(userId, { lobby: null, room: null });
    const usersRoom = await this.roomsService.getAllForUser(userId);
    if (!!usersRoom) {
      await this.roomsService.deleteRoom(usersRoom.id);
      this.server.emit(ROOM_DELETED, usersRoom);
    }

    const user = await this.usersService.findOne(userId);

    // this.server.emit(USER_DISCONNECTED, user);
  }

  @SubscribeMessage(USER_JOINED_LOBBY)
  async handleUserJoinedLobby(@MessageBody() data: UserJoinedLobbyDto) {
    await this.usersService.addUserToLobby(data);
    this.server.emit(USER_JOINED_LOBBY, data);
  }

  @SubscribeMessage(USER_LEFT_LOBBY)
  async handleUserLeftLobby(
    @MessageBody() data: UserJoinedLobbyDto,
    @ConnectedSocket() client: any,
  ) {
    const { userId } = client.handshake.query || {};
    this.usersService.updateUser(userId, { lobby: null });
    this.server.emit(USER_LEFT_LOBBY, data);
  }

  @SubscribeMessage(USER_JOINED_ROOM)
  async handleUserJoinedRoom(
    @MessageBody() data: UserJoinedRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    const room = await this.roomsService.getRoomById(data.roomId);
    this.usersService.updateUser(data.user.id, { room });
    this.server.emit(USER_JOINED_ROOM, data);

    client.join(`room-${String(room.id)}`);
  }

  @SubscribeMessage(USER_LEFT_ROOM)
  async handleUserLeftRoom(
    @MessageBody() room: Room,
    @ConnectedSocket() client: any,
  ) {
    const { userId } = client.handshake.query || {};
    this.usersService.updateUser(userId, { room: null });
    this.server.emit(USER_LEFT_ROOM, room);
  }

  @SubscribeMessage(ROOM_CREATED)
  async handleRoomCreated(
    @MessageBody() room: Room,
    @ConnectedSocket() client: any,
  ) {
    const { userId } = client.handshake.query || {};
    this.usersService.updateUser(userId, { room });
    this.server.emit(ROOM_CREATED, room);

    client.join(`room-${String(room.id)}`);
  }

  @SubscribeMessage(ROOM_DELETED)
  async handleRoomDeleted(@MessageBody() room: Room) {
    this.server.emit(ROOM_DELETED, room);
  }

  @SubscribeMessage(GAME_STARTED)
  async handleGameStarted(@MessageBody() room: Room) {
    const questions = await this.questionsService.getQuestions({
      count: room.questionsCount,
      topic: room.topic,
    });

    this.server.to(`room-${String(room.id)}`).emit(GAME_STARTED, questions);
  }
}
