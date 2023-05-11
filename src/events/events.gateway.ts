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
import { SelectAnswerDto } from './dtos/select-answer.dto';
import { UserReadyDto } from './dtos/user-ready.dto';
import { roomName } from './util/create-room-name';

const {
  ROOM_CREATED,
  ROOM_DELETED,
  USER_JOINED_LOBBY,
  USER_JOINED_ROOM,
  USER_LEFT_LOBBY,
  USER_LEFT_ROOM,
  USER_READY,
  GAME_STARTED,
  CORRECT_ANSWER_SELECTED,
  WRONG_ANSWER_SELECTED,
  KICK_USER_FROM_ROOM,
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

    client.join(roomName(room.id));
  }

  @SubscribeMessage(USER_LEFT_ROOM)
  async handleUserLeftRoom(
    @MessageBody() { room, user },
    @ConnectedSocket() client: any,
  ) {
    this.usersService.updateUser(user.id, { room: null });
    this.server.emit(USER_LEFT_ROOM, { user, room });

    client.leave(roomName(room.id));
  }

  @SubscribeMessage(KICK_USER_FROM_ROOM)
  async handleUserKickedFromRoom(@MessageBody() { user, room }) {
    await this.usersService.updateUser(user?.id, { room: null });
    this.server.emit(KICK_USER_FROM_ROOM, { user, room });
  }

  @SubscribeMessage(ROOM_CREATED)
  async handleRoomCreated(
    @MessageBody() room: Room,
    @ConnectedSocket() client: any,
  ) {
    const { userId } = client.handshake.query || {};
    this.usersService.updateUser(userId, { room });
    this.server.emit(ROOM_CREATED, room);

    client.join(roomName(room.id));
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

    this.roomsService.updateRoom({ roomId: room.id, readyUsers: [] });
    this.server.emit(GAME_STARTED, { questions, roomId: room.id });
  }

  @SubscribeMessage(CORRECT_ANSWER_SELECTED)
  async handleCorrectAnswerSelected(
    @MessageBody() { roomId, answer, userId }: SelectAnswerDto,
  ) {
    this.server
      .to(roomName(roomId))
      .emit(CORRECT_ANSWER_SELECTED, { answer, userId });
  }

  @SubscribeMessage(WRONG_ANSWER_SELECTED)
  async handleWrongAnswerSelected(
    @MessageBody() { roomId, answer, userId }: SelectAnswerDto,
  ) {
    this.server
      .to(roomName(roomId))
      .emit(WRONG_ANSWER_SELECTED, { answer, userId });
  }

  @SubscribeMessage(USER_READY)
  async handleUserReady(
    @MessageBody() { isReady, userId, roomId }: UserReadyDto,
  ) {
    if (isReady) {
      const room = await this.roomsService.getRoomById(roomId);
      if (!room) return;

      this.roomsService.updateRoom({
        roomId,
        readyUsers: [...room.readyUsers, String(userId)],
      });

      this.server.emit(USER_READY, { roomId, userId });
    } else {
    }
  }
}
