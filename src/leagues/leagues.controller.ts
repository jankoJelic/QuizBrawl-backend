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

  @Patch('/league/:id/addQuiz')
  async addQuiz() {}
}
