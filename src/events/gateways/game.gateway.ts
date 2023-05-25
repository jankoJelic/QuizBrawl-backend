import { UsersService } from 'src/auth/users.service';
import { EventsGateway } from '../events.gateway';
import { RoomsService } from 'src/rooms/rooms.service';
import { SOCKET_EVENTS } from '../constants/events';
import { MessageBody, SubscribeMessage } from '@nestjs/websockets';
import { QuestionsService } from 'src/questions/questions.service';
import { MessagesService } from 'src/messages/messages.service';
import { RewardsService } from 'src/rewards/rewards.service';
import { roomName } from '../util/create-room-name';
import { Room } from 'src/rooms/room.entity';
import { SelectAnswerDto } from '../dtos/select-answer.dto';

export class GameGateway extends EventsGateway {
  constructor(
    usersService: UsersService,
    roomsService: RoomsService,
    questionsService: QuestionsService,
    messagesService: MessagesService,
    rewardsService: RewardsService,
  ) {
    super(
      usersService,
      roomsService,
      questionsService,
      messagesService,
      rewardsService,
    );
  }

  @SubscribeMessage(SOCKET_EVENTS.GAME_STARTED)
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
    this.server.emit(SOCKET_EVENTS.GAME_STARTED, {
      questions,
      roomId: room.id,
    });
  }

  @SubscribeMessage(SOCKET_EVENTS.GAME_ENDED)
  async handleGameEnded(@MessageBody() room: Room) {
    this.roomsService.updateRoom({ roomId: room.id, gameStarted: false });
  }

  @SubscribeMessage(SOCKET_EVENTS.CORRECT_ANSWER_SELECTED)
  async handleCorrectAnswerSelected(
    @MessageBody() { roomId, answer, userId, topic }: SelectAnswerDto,
  ) {
    this.server
      .to(roomName(roomId))
      .emit(SOCKET_EVENTS.CORRECT_ANSWER_SELECTED, { answer, userId });

    const user = await this.usersService.findOne(userId);
    this.usersService.registerAnswer(user, true, topic);
  }

  @SubscribeMessage(SOCKET_EVENTS.WRONG_ANSWER_SELECTED)
  async handleWrongAnswerSelected(
    @MessageBody() { roomId, answer, userId, topic }: SelectAnswerDto,
  ) {
    this.server
      .to(roomName(roomId))
      .emit(SOCKET_EVENTS.WRONG_ANSWER_SELECTED, { answer, userId });

    const user = await this.usersService.findOne(userId);
    this.usersService.registerAnswer(user, false, topic);
  }
}
