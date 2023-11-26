import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/auth/user.entity';
import { GameService } from './game.service';
import { UsersService } from 'src/auth/users.service';
import { RegisterAnswerDto } from './dtos/register-answer.dto';

@ApiTags('game')
@Controller('game')
export class GameController {
  constructor(
    private gameService: GameService,
    private usersService: UsersService,
  ) {}

  @Get('/daily')
  async startDailyEvent(@CurrentUser() user: User, @Query('id') id: string) {
    return await this.gameService.startDailyEvent(user, Number(id));
  }

  @Post('/answer')
  async registerAnswer(
    @CurrentUser() user: User,
    @Body() body: RegisterAnswerDto,
  ) {
    return await this.usersService.registerAnswer(
      user,
      body.correct,
      body.topic,
    );
  }

  @Get('/quick')
  async startQuickGame(@CurrentUser() user: User) {
    return await this.gameService.startQuickGame({ user });
  }
}
