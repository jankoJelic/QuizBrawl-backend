import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { League } from './league.entity';
import { RewardsService } from 'src/rewards/rewards.service';
import { CreateLeagueDto } from './dtos/create-league.dto';
import { ShallowUser } from 'src/auth/util/shallowUser';

@Injectable()
export class LeaguesService {
  constructor(
    @InjectRepository(League)
    private leaguesRepository: Repository<League>,
    private rewardsService: RewardsService,
  ) {}

  async getLeagueById(id: number) {
    return await this.leaguesRepository.findOne({ where: { id } });
  }

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

  async createLeague(user: ShallowUser, body: CreateLeagueDto) {
    return await this.leaguesRepository.save({
      ...body,
      userId: user.id,
      users: [user],
    });
  }

  async updateLeague(id: number, body: Partial<CreateLeagueDto>) {
    return await this.leaguesRepository.update(id, body);
  }
}