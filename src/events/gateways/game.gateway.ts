import { UsersService } from 'src/auth/users.service';
import { EventsGateway } from '../events.gateway';
import { RoomsService } from 'src/rooms/rooms.service';
import { SOCKET_EVENTS } from '../constants/events';
import { MessageBody, SubscribeMessage } from '@nestjs/websockets';
import { QuestionsService } from 'src/questions/questions.service';
import { MessagesService } from 'src/messages/messages.service';
import { RewardsService } from 'src/rewards/rewards.service';
import { leagueName, roomName } from '../util/create-room-name';
import { Room } from 'src/rooms/room.entity';
import { SelectAnswerDto } from '../dtos/select-answer.dto';
import { Question } from 'src/questions/question.entity';
import { LeaguesService } from 'src/leagues/leagues.service';

export class GameGateway extends EventsGateway {
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

  @SubscribeMessage(SOCKET_EVENTS.GAME_STARTED)
  async handleGameStarted(
    @MessageBody() body: { room: Room; questions?: Question[] },
  ) {
    const { room, questions } = body || {};
    let questionsToUse = [];

    if (questions) {
      questionsToUse = questions;
    } else {
      const newQuestions = await this.questionsService.getQuestionsForRoom(
        room,
      );
      questionsToUse = newQuestions;
    }

    this.roomsService.updateRoom({
      roomId: room.id,
      readyUsers: [],
      gameStarted: true,
    });
    this.server.emit(SOCKET_EVENTS.GAME_STARTED, {
      questions: questionsToUse,
      roomId: room.id,
    });
  }

  @SubscribeMessage(SOCKET_EVENTS.GAME_ENDED)
  async handleGameEnded(@MessageBody() room: Room) {
    this.roomsService.updateRoom({ roomId: room.id, gameStarted: false });
  }

  @SubscribeMessage(SOCKET_EVENTS.CORRECT_ANSWER_SELECTED)
  async handleCorrectAnswerSelected(
    @MessageBody() { roomId, answer, userId, topic, leagueId }: SelectAnswerDto,
  ) {
    if (leagueId) {
      this.server
        .to(leagueName(leagueId))
        .emit(SOCKET_EVENTS.CORRECT_ANSWER_SELECTED, { answer, userId });
    } else {
      this.server
        .to(roomName(roomId))
        .emit(SOCKET_EVENTS.CORRECT_ANSWER_SELECTED, { answer, userId });

      const user = await this.usersService.findOne(userId);
      this.usersService.registerAnswer(user, true, topic);
    }
  }

  @SubscribeMessage(SOCKET_EVENTS.WRONG_ANSWER_SELECTED)
  async handleWrongAnswerSelected(
    @MessageBody() { roomId, answer, userId, topic, leagueId }: SelectAnswerDto,
  ) {
    if (leagueId) {
      this.server
        .to(leagueName(leagueId))
        .emit(SOCKET_EVENTS.WRONG_ANSWER_SELECTED, { answer, userId });
    } else {
      this.server
        .to(roomName(roomId))
        .emit(SOCKET_EVENTS.WRONG_ANSWER_SELECTED, { answer, userId });

      const user = await this.usersService.findOne(userId);
      this.usersService.registerAnswer(user, false, topic);
    }
  }
}
