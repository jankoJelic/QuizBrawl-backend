import { Injectable } from '@nestjs/common';
import { User } from 'src/auth/user.entity';
import { CreateTeamDto } from './dtos/create-team-dto';

@Injectable()
export class TeamsService {
  async createTeam(user: User, createTeamDto: CreateTeamDto) {}

  async deleteTeam(id: number, user: User) {}

  async updateTeam(id: number, user: User) {}
}
