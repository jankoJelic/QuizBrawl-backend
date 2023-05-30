import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { League } from './league.entity';

@Injectable()
export class LeaguesService {
  constructor(
    @InjectRepository(League)
    private leaguesRepository: Repository<League>,
  ) {}

  async getAll() {
    return await this.leaguesRepository.find();
  }

  async getMyLeagues() {}

  async deleteLeague() {}

  
}
