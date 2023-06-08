import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LeaguesService } from './leagues.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/auth/user.entity';
import { CreateLeagueDto } from './dtos/create-league.dto';
import { shallowUser } from 'src/auth/util/shallowUser';

@ApiTags('leagues')
@Controller('leagues')
export class LeaguesController {
  constructor(private leaguesService: LeaguesService) {}

  @Get('/')
  async getLeagues() {
    return await this.leaguesService.getAll();
  }

  @Get('/images')
  async getLeagueImages() {
    return await this.leaguesService.getLeaguesImages();
  }

  @Delete('/')
  deleteAllLeagues() {
    this.leaguesService.deleteAllLeagues();
  }

  @Get('/my')
  async getMyLeagues(@CurrentUser() user: User) {
    return await this.leaguesService.getMyLeagues(user.id);
  }

  @Get('/league/:id')
  async getLeague(@Param('id') id: string) {
    return await this.leaguesService.getLeagueById(Number(id));
  }

  @Get('/league/:id/history')
  async getLeagueHistory() {}

  @Post('/league')
  async createLeague(@CurrentUser() user: User, @Body() body: CreateLeagueDto) {
    return await this.leaguesService.createLeague(shallowUser(user), body);
  }

  @Delete('/league/:id')
  async deleteLeague(@Param('id') id: string, @CurrentUser() user: User) {
    return this.leaguesService.deleteLeague(Number(id), user.id);
  }

  @Patch('/league/:id/addPlayer')
  async addPlayer() {}

  @Patch('/:id/addQuiz/:quizId')
  async addQuiz(
    @Param('id') leagueId: string,
    @Param('quizId') quizId: string,
  ) {
    return this.leaguesService.addQuizToLeague(
      Number(quizId),
      Number(leagueId),
    );
  }

  @Post('/league/:id/score')
  async registerLeagueScore(
    @Param('id') leagueId: string,
    @Body() body: { score: Record<number, number> },
    @CurrentUser() user: User,
  ) {
    return await this.leaguesService.registerLeagueGameScore(
      Number(leagueId),
      body.score,
      user,
    );
  }

  @Post('/league/:id/leave')
  async leaveLeague(@Param('id') id: string, @CurrentUser() user: User) {
    await this.leaguesService.leaveLeague(user.id, Number(id));
  }

  @Post('/league/:id/answer')
  registerAnswer(
    @Param('id') leagueId: string,
    @CurrentUser() user: User,
    @Body() body: { correct: boolean },
  ) {
    this.leaguesService.registerAnswer({
      userId: user.id,
      leagueId: Number(leagueId),
      correct: body.correct,
    });
  }
}
