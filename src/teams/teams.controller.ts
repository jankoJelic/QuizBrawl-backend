import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/auth/user.entity';
import { CreateTeamDto } from './dtos/create-team-dto';
import { TeamsService } from './teams.service';

@ApiTags('teams')
@Controller('teams')
export class TeamsController {
  constructor(private teamsService: TeamsService) {}
  @Post('/')
  async createTeam(@CurrentUser() user: User, @Body() body: CreateTeamDto) {
    
  }
}
