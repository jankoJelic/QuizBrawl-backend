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
import { Quiz } from 'src/quizes/quiz.entity';

const {
  USER_JOINED_LEAGUE,
  USER_LEFT_LEAGUE,
  USER_JOINED_LEAGUE_ROOM,
  USER_LEFT_LEAGUE_ROOM,
  LEAGUE_GAME_STARTED,
  LEAGUE_DELETED,
  NEXT_QUIZ_SELECTED,
} = SOCKET_EVENTS;

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

  @SubscribeMessage(USER_JOINED_LEAGUE_ROOM)
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
      .emit(USER_JOINED_LEAGUE_ROOM, user);
  }

  @SubscribeMessage(USER_JOINED_LEAGUE)
  async handleUserJoinedLeague(
    @MessageBody() body: { user: ShallowUser; leagueId: number },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(this.leagueChannel(body.leagueId));

    const league = await this.leaguesService.getLeagueById(body.leagueId);

    if (league?.users?.some((u) => u.id === body.user.id)) return;

    await this.leaguesService.addUserToLeague(body.user.id, body.leagueId);

    this.server
      .to(this.leagueChannel(body.leagueId))
      .emit(USER_JOINED_LEAGUE, body.user);
  }

  @SubscribeMessage(NEXT_QUIZ_SELECTED)
  async setNextQuiz(@MessageBody() body: { quiz: Quiz; leagueId: number }) {
    this.leaguesService.setNextQuiz(body.leagueId, body.quiz.id);
    this.server
      .to(this.leagueChannel(body.leagueId))
      .emit(NEXT_QUIZ_SELECTED, { quiz: body.quiz });
  }

  @SubscribeMessage(USER_LEFT_LEAGUE_ROOM)
  async handleUserLeftoLeagueRoom(
    @MessageBody() body: { leagueId: number; userId: number },
  ) {
    await this.leaguesService.changeUserReadyStatus(
      body.leagueId,
      body.userId,
      false,
    );
    this.server
      .to(this.leagueChannel(body.leagueId))
      .emit(USER_LEFT_LEAGUE_ROOM, { userId: body.userId });
  }

  @SubscribeMessage(LEAGUE_GAME_STARTED)
  async startLeagueGame(@MessageBody() body: { leagueId: number; quiz: Quiz }) {
    await this.leaguesService.updateLeague(body.leagueId, {
      gameInProgress: true,
    });
    const league = await this.leaguesService.getLeagueById(body.leagueId);
    this.server
      .to(this.leagueChannel(body.leagueId))
      .emit(LEAGUE_GAME_STARTED, { quiz: body.quiz, league });
  }

  @SubscribeMessage(USER_LEFT_LEAGUE)
  async removeUserFromLeague(
    @MessageBody() body: { userId: number; leagueId: number },
  ) {
    this.leaguesService.removeUserFromLeague(body.userId, body.leagueId);
    this.server
      .to(this.leagueChannel(body.leagueId))
      .emit(USER_LEFT_LEAGUE, body.userId);
  }

  @SubscribeMessage(LEAGUE_DELETED)
  handleLeagueDeleted(@MessageBody() leagueId: number) {
    this.server.to(this.leagueChannel(leagueId)).emit(LEAGUE_DELETED, leagueId);
  }
}
