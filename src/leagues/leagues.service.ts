import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { League } from './league.entity';
import { RewardsService } from 'src/rewards/rewards.service';
import { CreateLeagueDto } from './dtos/create-league.dto';
import { ShallowUser } from 'src/auth/util/shallowUser';
import { Quiz } from 'src/quizes/quiz.entity';
import { UsersService } from 'src/auth/users.service';
import { User } from 'src/auth/user.entity';

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
    league.users.forEach(async (user) => {
      await this.removeUserFromLeague(user.id, league.id);
    });
    return await this.leaguesRepository.delete(id);
  }

  async getLeaguesImages() {
    let imgs = await this.rewardsService.getFirebaseStorageFiles('leagues');
    imgs.unshift();
    return imgs;
  }

  async createLeague(user: ShallowUser, body: CreateLeagueDto) {
    const myUser = await this.usersService.findOne(user.id);
    const initialAnswers = {
      [user.id]: 0,
    };
    const newLeague = await this.leaguesRepository.save({
      ...body,
      userId: user.id,
      users: [user],
      nextQuizUserId: user.id,
      correctAnswers: initialAnswers,
      totalAnswers: initialAnswers,
      gamesPlayed: { [user.id]: 0 },
      readyUsers: [user.id],
      score: { [user.id]: 0 },
      quizIds: [],
      playedQuizIds: [],
      quizIdHistory: [],
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
      totalAnswers: { ...league.totalAnswers, [userId]: 0 },
      correctAnswers: { ...league.correctAnswers, [userId]: 0 },
      readyUsers: league.readyUsers.concat([userId]),
      score: { ...league.score, [userId]: 0 },
      gamesPlayed: { ...league.gamesPlayed, [userId]: 0 },
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
    delete league.totalAnswers[userId];
    delete league.correctAnswers[userId];
    this.leaguesRepository.update(leagueId, {
      users: currentUsers.filter((u) => u.id !== userId),
      correctAnswers: league.correctAnswers,
      totalAnswers: league.totalAnswers,
      readyUsers: league.readyUsers.filter((u) => u !== userId),
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
    const currentReadyUsers = league?.readyUsers ? league.readyUsers : [];

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

  async registerLeagueGameScore({
    leagueId,
    score,
    currentUser,
    quizId,
  }: {
    leagueId: number;
    score: Record<number, number>;
    currentUser: User;
    quizId: number;
  }) {
    const league = await this.getLeagueById(leagueId);
    const {
      users,
      score: currentScore,
      quizIdHistory,
      gamesPlayed,
      type,
    } = league || {};

    const quiz = await this.quizesRepository.findOne({
      where: { id: quizId },
    });
    const quizAdminId = quiz.userId;

    delete score[quizAdminId];

    const { playersCount, scoresLargestFirst, yourPosition, yourScore } =
      this.rewardsService.processMultiPlayerScore(score, currentUser);

    const reward = this.rewardsService.calculateMultiPlayerReward({
      playersCount,
      scoresLargestFirst,
      yourPosition,
      yourScore,
    });

    if (quizAdminId !== currentUser.id)
      await this.leaguesRepository.update(leagueId, {
        score: {
          ...currentScore,
          [currentUser.id]: currentScore[currentUser.id] + reward,
        },
        gamesPlayed: {
          ...gamesPlayed,
          [currentUser.id]: gamesPlayed[currentUser.id] + 1,
        },
      });

    if (!quizIdHistory.includes(quizId)) {
      const currentQuizUserIndex = users.findIndex((u) => u.id === quizAdminId);
      const isLastUserInArray = currentQuizUserIndex + 1 === users.length;
      const nextUserIndex = isLastUserInArray ? 0 : currentQuizUserIndex + 1;
      await this.leaguesRepository.update(leagueId, {
        gameInProgress: false,
        selectedQuizId: 0,
        quizIdHistory: league.quizIdHistory.concat(quizId),
        ...(type === 'ROUND' && { nextQuizUserId: users[nextUserIndex].id }),
      });
    }

    return reward;
  }

  async registerAnswer({ userId, correct, leagueId }: RegisterAnswerParams) {
    const league = await this.getLeagueById(leagueId);
    const { totalAnswers, correctAnswers } = league || {};
    await this.leaguesRepository.update(leagueId, {
      totalAnswers: {
        ...totalAnswers,
        [userId]: totalAnswers[userId] + 1,
      },
      correctAnswers: {
        ...correctAnswers,
        [userId]: correctAnswers[userId] + (correct ? 1 : 0),
      },
    });
  }

  async leaveLeague(userId: number, leagueId: number) {
    const user = await this.usersService.findOne(userId);
    const userLeagues = user?.leagueIds;
    await this.usersService.updateUser(userId, {
      leagueIds: userLeagues.filter((id) => id !== leagueId),
    });
    const league = await this.leaguesRepository.findOne({
      where: { id: leagueId },
    });
    if (!league) return;
    const currentUsers = league.users;
    await this.leaguesRepository.update(leagueId, {
      users: currentUsers.filter((u) => u.id !== userId),
    });
  }
}

interface RegisterAnswerParams {
  userId: number;
  correct: boolean;
  leagueId: number;
}
