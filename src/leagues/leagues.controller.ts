import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LeaguesService } from './leagues.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/auth/user.entity';

@ApiTags('leagues')
@Controller('leagues')
export class LeaguesController {
  constructor(private leaguesService: LeaguesService) {}

  @Get('/')
  async getLeagues() {
    return await this.leaguesService.getAll();
  }

  @Get('/my')
  async getMyLeagues() {}

  @Post('/league')
  async createLeague(@CurrentUser() user: User) {}

  @Delete('/league/:id')
  async deleteLeague(@Param('id') id:string) {
    return this.leaguesService

  }
}
