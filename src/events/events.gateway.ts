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
import { UsersService } from 'src/auth/users.service';
import { SOCKET_EVENTS } from './constants/events';
import { RoomsService } from 'src/rooms/rooms.service';
import { QuestionsService } from 'src/questions/questions.service';
import { User } from 'src/auth/user.entity';
import { MessagesService } from 'src/messages/messages.service';
import { shallowUser } from 'src/auth/util/shallowUser';
import { RewardsService } from 'src/rewards/rewards.service';

const {
  ROOM_DELETED,
  USER_LEFT_LOBBY,
  USER_LEFT_ROOM,
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
