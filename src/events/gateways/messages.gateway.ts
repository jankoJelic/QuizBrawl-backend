import { UsersService } from 'src/auth/users.service';
import { EventsGateway } from '../events.gateway';
import { RoomsService } from 'src/rooms/rooms.service';
import { SOCKET_EVENTS } from '../constants/events';
import { MessageBody, SubscribeMessage } from '@nestjs/websockets';
import { QuestionsService } from 'src/questions/questions.service';
import { MessagesService } from 'src/messages/messages.service';
import { RewardsService } from 'src/rewards/rewards.service';
import { User } from 'src/auth/user.entity';
import { shallowUser } from 'src/auth/util/shallowUser';
import { LeaguesService } from 'src/leagues/leagues.service';

export class MessagesGateway extends EventsGateway {
  constructor(
    usersService: UsersService,
    roomsService: RoomsService,
    questionsService: QuestionsService,
    messagesService: MessagesService,
    rewardsService: RewardsService,
    leaguesService: LeaguesService,
  ) {
    super(
      usersService,
      roomsService,
      questionsService,
      messagesService,
      rewardsService,
      leaguesService,
    );
  }

  @SubscribeMessage(SOCKET_EVENTS.FRIEND_REQUEST_SENT)
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
      .emit(SOCKET_EVENTS.FRIEND_REQUEST_SENT, {
        friendRequest,
      });
  }

  @SubscribeMessage(SOCKET_EVENTS.FRIEND_REQUEST_ACCEPTED)
  async handleFriendRequestAccepted(
    @MessageBody() body: { user: User; senderId: number },
  ) {
    this.usersService.makeFriends(body.user.id, body.senderId);
    this.server
      .to(`user-${String(body.senderId)}`)
      .emit(SOCKET_EVENTS.FRIEND_REQUEST_ACCEPTED, shallowUser(body.user));
  }

  @SubscribeMessage(SOCKET_EVENTS.FRIEND_REMOVED)
  async handleFriendRemoved(
    @MessageBody() body: { userId: number; removedFriendId: number },
  ) {
    const { userId, removedFriendId } = body;
    this.usersService.removeFriends(userId, removedFriendId);
    this.server
      .to(`user-${String(removedFriendId)}`)
      .emit(SOCKET_EVENTS.FRIEND_REMOVED, userId);
  }
}
