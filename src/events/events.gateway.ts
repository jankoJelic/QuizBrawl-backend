import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsersService } from 'src/auth/users.service';
import { SOCKET_EVENTS } from './constants/events';
import { RoomsService } from 'src/rooms/rooms.service';
import { QuestionsService } from 'src/questions/questions.service';
import { MessagesService } from 'src/messages/messages.service';
import { RewardsService } from 'src/rewards/rewards.service';
import { LOBBY_IDS } from 'src/lobbies/constants/lobby-ids';

const {
  ROOM_DELETED,
  USER_LEFT_LOBBY,
  USER_LEFT_ROOM,
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
        if (user.room.lobbyId === LOBBY_IDS.CASH_GAME) {
          this.rewardsService.sendMoneyToUser(user.id, -user.room.bet);
        }

        if (user.room.lobbyId === LOBBY_IDS.SOLO) {
          this.rewardsService.sendMoneyToUser(user.id, -10);
        }

        if (user.room.lobbyId === LOBBY_IDS.ARENA)
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
}
