import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/auth/user.entity';
import { QuestionsService } from 'src/questions/questions.service';
import { GameService } from './game.service';
import { UsersService } from 'src/auth/users.service';

@ApiTags('game')
@Controller('game')
export class GameController {
  constructor(
    private questionsService: QuestionsService,
    private gameService: GameService,
    private usersService: UsersService,
  ) {}

  @Get('/daily')
  async startDailyEvent(@CurrentUser() user: User, @Query('id') id: string) {
    return await this.gameService.startDailyEvent(user, Number(id));
  }
}
