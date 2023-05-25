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
import { User } from 'src/auth/user.entity';
import { MessagesService } from 'src/messages/messages.service';
import { shallowUser } from 'src/auth/util/shallowUser';
import { emit } from 'process';
import { RewardsService } from 'src/rewards/rewards.service';

const {
  ROOM_CREATED,
  ROOM_DELETED,
  USER_JOINED_LOBBY,
  USER_JOINED_ROOM,
  USER_LEFT_LOBBY,
  USER_LEFT_ROOM,
  USER_READY,
  GAME_STARTED,
  GAME_ENDED,
  CORRECT_ANSWER_SELECTED,
  WRONG_ANSWER_SELECTED,
  KICK_USER_FROM_ROOM,
  FRIEND_REQUEST_SENT,
  FRIEND_REQUEST_ACCEPTED,
  USER_DISCONNECTED,
  USER_CONNECTED,
  FRIEND_REMOVED,
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
    public usersService: UsersService,
    public roomsService: RoomsService,
    public questionsService: QuestionsService,
    public messagesService: MessagesService,
    public rewardsService: RewardsService,
  ) {}

  @WebSocketServer()
  public server: Server;

  afterInit(server: any) {}

  handleConnection(@ConnectedSocket() client: Socket) {
    const { userId } = client.handshake.query || {};

    this.usersService.updateUser(Number(userId), { isOnline: true });

    client.join(`user-${String(userId)}`);

    this.server.emit(USER_CONNECTED, userId);
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    const { userId } = client.handshake.query || {};
    const user = await this.usersService.findOne(Number(userId));

    if (!!user?.lobby) {
      this.server.emit(USER_LEFT_LOBBY, { user, lobbyId: user.lobby.id });
    }

    if (!!user?.room) {
      this.server.emit(USER_LEFT_ROOM, { room: user.room, user });
      if (user.room.gameStarted) {
        this.rewardsService.sendTrophiesToUser(
          user.id,
          user.room.users.length * -1,
        );
      }
    }

    if (user?.room?.users?.length === 1) {
      this.server.emit(ROOM_DELETED, user?.room);
      this.roomsService.deleteRoom(user?.room?.id);
    }

    this.server.emit(USER_DISCONNECTED, userId);
    this.usersService.updateUser(Number(userId), {
      lobby: null,
      room: null,
      isOnline: false,
    });
    client.leave(`user-${String(userId)}`);
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

    this.roomsService.updateRoom({
      roomId: room.id,
      readyUsers: [],
      gameStarted: true,
    });
    this.server.emit(GAME_STARTED, { questions, roomId: room.id });
  }

  @SubscribeMessage(GAME_ENDED)
  async handleGameEnded(@MessageBody() room: Room) {
    this.roomsService.updateRoom({ roomId: room.id, gameStarted: false });
  }

  @SubscribeMessage(CORRECT_ANSWER_SELECTED)
  async handleCorrectAnswerSelected(
    @MessageBody() { roomId, answer, userId, topic }: SelectAnswerDto,
  ) {
    this.server
      .to(roomName(roomId))
      .emit(CORRECT_ANSWER_SELECTED, { answer, userId });

    const user = await this.usersService.findOne(userId);
    this.usersService.registerAnswer(user, true, topic);
  }

  @SubscribeMessage(WRONG_ANSWER_SELECTED)
  async handleWrongAnswerSelected(
    @MessageBody() { roomId, answer, userId, topic }: SelectAnswerDto,
  ) {
    this.server
      .to(roomName(roomId))
      .emit(WRONG_ANSWER_SELECTED, { answer, userId });

    const user = await this.usersService.findOne(userId);
    this.usersService.registerAnswer(user, false, topic);
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

  @SubscribeMessage(FRIEND_REQUEST_SENT)
  async handleFriendRequestSent(
    @MessageBody() body: { user: User; recipientId: number },
  ) {
    const friendRequest = await this.messagesService.sendFriendRequest(
      body?.user,
      body?.recipientId,
    );

    if (typeof friendRequest === 'string') return;
    if (!friendRequest?.title) return;

    this.server
      .to(`user-${String(body.recipientId)}`)
      .emit(FRIEND_REQUEST_SENT, {
        friendRequest,
      });
  }

  @SubscribeMessage(FRIEND_REQUEST_ACCEPTED)
  async handleFriendRequestAccepted(
    @MessageBody() body: { user: User; senderId: number },
  ) {
    this.usersService.makeFriends(body.user.id, body.senderId);
    this.server
      .to(`user-${String(body.senderId)}`)
      .emit(FRIEND_REQUEST_ACCEPTED, shallowUser(body.user));
  }

  @SubscribeMessage(FRIEND_REMOVED)
  async handleFriendRemoved(
    @MessageBody() body: { userId: number; removedFriendId: number },
  ) {
    const { userId, removedFriendId } = body;
    this.usersService.removeFriends(userId, removedFriendId);
    this.server
      .to(`user-${String(removedFriendId)}`)
      .emit(FRIEND_REMOVED, userId);
  }
}
