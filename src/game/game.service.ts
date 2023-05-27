import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/auth/user.entity';
import { UsersService } from 'src/auth/users.service';
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
}
