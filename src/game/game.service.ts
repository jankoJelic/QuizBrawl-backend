import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/auth/user.entity';
import { UsersService } from 'src/auth/users.service';
import { LOBBY_IDS } from 'src/lobbies/constants/lobby-ids';
import { QuestionsService } from 'src/questions/questions.service';
import { RoomsService } from 'src/rooms/rooms.service';

@Injectable()
export class GameService {
  constructor(
    private questionsService: QuestionsService,
    private usersService: UsersService,
    private roomsService: RoomsService,
  ) {}

  async startDailyEvent(user: User, dailyId: number) {
    const myUser = await this.usersService.findOne(user.id);
    let userDailies = myUser.dailies ? myUser.dailies : {};

    if (dailyId in userDailies) return new UnauthorizedException();
    const room = await this.roomsService.getRoomById(dailyId);
    const questions = await this.questionsService.getQuestionsForRoom(room);
    userDailies[dailyId] = 0;
    this.usersService.updateUser(user.id, { dailies: userDailies });
    return questions;
  }

  async startQuickGame({ user }: { user: User }) {
    const bots = await this.usersService.getBots();
    const botsToInclude = bots.slice(0, 3);
    const room = await this.roomsService.createRoom({
      topic: 'General',
      answerTime: 15,
      hostName: user.firstName,
      name: 'Quick game',
      lobbyId: LOBBY_IDS.ARENA,
      userId: user.id,
      maxPlayers: 5,
      users: [user, ...botsToInclude],
    });
    const questions = await this.questionsService.getQuestionsForRoom(room);
    return { questions, room };
  }
}
