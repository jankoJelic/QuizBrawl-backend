import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { League } from './league.entity';
import { RewardsService } from 'src/rewards/rewards.service';
import { CreateLeagueDto } from './dtos/create-league.dto';

@Injectable()
export class LeaguesService {
  constructor(
    @InjectRepository(League)
    private leaguesRepository: Repository<League>,
    private rewardsService: RewardsService,
  ) {}

  async getAll() {
    return await this.leaguesRepository.find();
  }

  async getMyLeagues(userId: number) {
    return await this.leaguesRepository.find({ where: { userId } });
  }

  async deleteLeague(id: number, userId: number) {
    const league = await this.leaguesRepository.findOneBy({ id });
    if (league.userId !== userId) throw new UnauthorizedException();
    return await this.leaguesRepository.delete(id);
  }

  async getLeaguesImages() {
    return await this.rewardsService.getFirebaseStorageFiles('leagues');
  }

  async createLeague(userId: number, body: CreateLeagueDto) {}

  async updateLeague(id: number, body: Partial<CreateLeagueDto>) {
    return await this.leaguesRepository.update(id, body);
  }
}
