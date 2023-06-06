import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { League } from './league.entity';
import { RewardsService } from 'src/rewards/rewards.service';
import { CreateLeagueDto } from './dtos/create-league.dto';
import { ShallowUser } from 'src/auth/util/shallowUser';
import { Quiz } from 'src/quizes/quiz.entity';
import { UsersService } from 'src/auth/users.service';

@Injectable()
export class LeaguesService {
  constructor(
    @InjectRepository(League)
    private leaguesRepository: Repository<League>,
    private rewardsService: RewardsService,
    @InjectRepository(Quiz)
    private quizesRepository: Repository<Quiz>,
    private usersService: UsersService,
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
    const myUser = await this.usersService.findOne(user.id);
    const newLeague = await this.leaguesRepository.save({
      ...body,
      userId: user.id,
      users: [user],
      nextQuizUserId: user.id,
    });

    this.usersService.updateUser(user.id, {
      leagueIds: (myUser?.leagueIds || []).concat([newLeague.id]),
    });
    return newLeague;
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

    return quiz;
  }

  async addUserToLeague(userId: number, leagueId: number) {
    const league = await this.leaguesRepository.findOne({
      where: { id: leagueId },
    });
    const currentUsers = league.users;
    const newUser = await this.usersService.findOne(userId);
    this.leaguesRepository.update(leagueId, {
      users: currentUsers.concat([newUser]),
    });
    this.usersService.updateUser(newUser.id, {
      leagueIds: (newUser?.leagueIds || []).concat(leagueId),
    });
  }

  async removeUserFromLeague(userId: number, leagueId: number) {
    const league = await this.leaguesRepository.findOne({
      where: { id: leagueId },
    });
    const currentUsers = league.users;
    const newUser = await this.usersService.findOne(userId);
    this.leaguesRepository.update(leagueId, {
      users: currentUsers.filter((u) => u.id !== userId),
    });
    this.usersService.updateUser(newUser.id, {
      leagueIds: newUser.leagueIds.filter((id) => id !== leagueId),
    });
  }

  async deleteAllLeagues() {
    this.leaguesRepository.clear();
  }

  async changeUserReadyStatus(
    leagueId: number,
    userId: number,
    status: boolean,
  ) {
    const league = await this.leaguesRepository.findOne({
      where: { id: leagueId },
    });
    const currentReadyUsers = league.readyUsers ? league.readyUsers : [];

    const updatedReadyUsers = status
      ? currentReadyUsers.concat([userId])
      : currentReadyUsers.filter((u) => u !== userId);

    this.leaguesRepository.update(leagueId, {
      readyUsers: updatedReadyUsers,
    });
  }

  async setNextQuiz(leagueId: number, quizId: number) {
    this.leaguesRepository.update(leagueId, { selectedQuizId: quizId });
  }
}
