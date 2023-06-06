import { UsersService } from 'src/auth/users.service';
import { EventsGateway } from '../events.gateway';
import { RoomsService } from 'src/rooms/rooms.service';
import { SOCKET_EVENTS } from '../constants/events';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
} from '@nestjs/websockets';
import { QuestionsService } from 'src/questions/questions.service';
import { MessagesService } from 'src/messages/messages.service';
import { RewardsService } from 'src/rewards/rewards.service';
import { ShallowUser } from 'src/auth/util/shallowUser';
import { LeaguesService } from 'src/leagues/leagues.service';
import { Socket } from 'socket.io';

export class LeaguesGateway extends EventsGateway {
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

  leagueChannel(leagueId: number) {
    return `league-${leagueId}`;
  }

  @SubscribeMessage(SOCKET_EVENTS.USER_JOINED_LEAGUE_ROOM)
  async handleUserJoinedLeagueRoom(
    @MessageBody() body: { leagueId: number },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(this.leagueChannel(body.leagueId));
    const { userId } = client.handshake.query || {};
    const user = await this.usersService.findById(Number(userId));
    const league = await this.leaguesService.getLeagueById(body.leagueId);

    if (!league?.users?.some((u) => u.id === Number(userId))) return;

    this.leaguesService.changeUserReadyStatus(
      body.leagueId,
      Number(userId),
      true,
    );

    this.server
      .to(this.leagueChannel(body.leagueId))
      .emit(SOCKET_EVENTS.USER_JOINED_LEAGUE_ROOM, user);
  }

  @SubscribeMessage(SOCKET_EVENTS.USER_JOINED_LEAGUE)
  async handleUserJoinedLeague(
    @MessageBody() body: { user: ShallowUser; leagueId: number },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(this.leagueChannel(body.leagueId));

    const league = await this.leaguesService.getLeagueById(body.leagueId);

    if (league?.users?.some((u) => u.id === body.user.id)) return;
    console.log('USER JOINED LEAGUE IN BE');
    await this.leaguesService.addUserToLeague(body.user.id, body.leagueId);

    this.server
      .to(this.leagueChannel(body.leagueId))
      .emit(SOCKET_EVENTS.USER_JOINED_LEAGUE, {
        user: body.user,
      });
  }
}
