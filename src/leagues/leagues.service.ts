import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { League } from './league.entity';
import { RewardsService } from 'src/rewards/rewards.service';
import { CreateLeagueDto } from './dtos/create-league.dto';
import { ShallowUser } from 'src/auth/util/shallowUser';
import { QuizesService } from 'src/quizes/quizes.service';
import { Quiz } from 'src/quizes/quiz.entity';

@Injectable()
export class LeaguesService {
  constructor(
    @InjectRepository(League)
    private leaguesRepository: Repository<League>,
    private rewardsService: RewardsService,
    @InjectRepository(Quiz)
    private quizesRepository: Repository<Quiz>,
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
    let imgs = await this.rewardsService.getFirebaseStorageFiles('leagues');
    imgs.unshift();
    return imgs;
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

  async addQuizToLeague(quizId: number, leagueId: number) {
    const league = await this.getLeagueById(leagueId);
    const currentQuizes = !!league.quizIds ? league.quizIds : [];
    this.leaguesRepository.update(leagueId, {
      quizIds: currentQuizes.concat([quizId]),
    });

    const quiz = await this.quizesRepository.findOne({ where: { id: quizId } });
    const currentLeagues = !!quiz.leagueIds ? quiz.leagueIds : [];
    this.quizesRepository.update(quizId, {
      leagueIds: currentLeagues.concat([leagueId]),
    });
  }
}
