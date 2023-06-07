import { Injectable } from '@nestjs/common';
import { User } from 'src/auth/user.entity';
import { UsersService } from 'src/auth/users.service';
import { RoomsService } from 'src/rooms/rooms.service';
import { getStorage } from 'firebase-admin/storage';
import { createStorageDownloadUrl } from 'src/util/firebase/createStorageDownloadUrl';
import { ConfigService } from '@nestjs/config';
import { shuffleArray } from 'src/util/arrays/shuffleArray';
import { REWARD_TYPES } from './constants/reward.types';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { rewardDistribution } from './constants/reward-distribution';
import { CalculateMultiplayerRewardDto } from './dtos/calculate-multiplayer-reward.dto';

@Injectable()
export class RewardsService {
  constructor(
    private usersService: UsersService,
    private roomsService: RoomsService,
    private configService: ConfigService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}
  processMultiPlayerScore(score: Record<number, number>, user: User) {
    const playerIds = Object.keys(score);
    const playersCount = playerIds?.length;
    const playerIdsByScore = playerIds.sort((a, b) =>
      score[a] < score[b] ? 1 : -1,
    );
    const scoresLargestFirst = Object.values(score).sort((a, b) =>
      a < b ? 1 : -1,
    );

    const yourPosition = playerIdsByScore.indexOf(String(user.id));
    const yourScore = score[user.id];

    return { playersCount, scoresLargestFirst, yourPosition, yourScore };
  }

  calculateMultiPlayerReward({
    scoresLargestFirst,
    yourScore,
    playersCount,
    yourPosition,
  }: CalculateMultiplayerRewardDto) {
    let duplicateScoresIndexes = [];
    scoresLargestFirst.forEach((item, index) => {
      if (item === yourScore) duplicateScoresIndexes.push(index);
    });

    const yourReward = () => {
      const multipleUsersWithSameScore = duplicateScoresIndexes.length > 1;

      if (multipleUsersWithSameScore) {
        const averageDistribution =
          duplicateScoresIndexes.reduce(
            (a, b) => a + rewardDistribution(playersCount)[b],
            0,
          ) / duplicateScoresIndexes.length;

        return Math.floor(averageDistribution);
      } else {
        return rewardDistribution(playersCount)[yourPosition];
      }
    };

    return yourReward();
  }

  async distributeCashGamePrizes(
    score: Record<number, number>,
    user: User,
    roomId: number,
  ) {
    const room = await this.roomsService.getRoomById(roomId);
    const { bet, maxPlayers, questionsCount } = room || {};
    if (!bet) return;

    const { playersCount, scoresLargestFirst, yourPosition, yourScore } =
      this.processMultiPlayerScore(score, user);

    const totalReward = bet * playersCount;

    let firstPlaceUsers = 1;
    for (let i = 1; i < playersCount; i++) {
      if (scoresLargestFirst[i] === scoresLargestFirst[0])
        firstPlaceUsers = firstPlaceUsers + 1;
      else break;
    }

    const distributedReward = Math.floor(totalReward / firstPlaceUsers) - bet;

    let winPayload = { money: distributedReward };

    if (yourPosition <= firstPlaceUsers - 1) {
      if (maxPlayers > 3) {
        const maxScore = maxPlayers * 3;
        const yourAccuracy = yourScore / maxScore;
        if (yourAccuracy > 0.8 && questionsCount > 9) {
          const reward = await this.rewardUserPerfectDaily(user, roomId);
          winPayload['reward'] = reward;
        }
      }
      await this.sendMoneyToUser(user.id, distributedReward);
      return winPayload;
    } else {
      await this.sendMoneyToUser(user.id, -bet);
      return { money: -bet };
    }
  }

  async distributeTrophies(score: Record<number, number>, user: User) {
    const { playersCount, scoresLargestFirst, yourPosition, yourScore } =
      this.processMultiPlayerScore(score, user);
    const currentUser = await this.usersService.findOne(user.id);
    const currentTrophies = currentUser.trophies;
    let duplicateScoresIndexes = [];
    scoresLargestFirst.forEach((item, index) => {
      if (item === yourScore) duplicateScoresIndexes.push(index);
    });
    const yourReward = this.calculateMultiPlayerReward({
      playersCount,
      scoresLargestFirst,
      yourPosition,
      yourScore,
    });
    const trophiesSum = currentTrophies + yourReward;
    const updatedTrophies = trophiesSum > 0 ? trophiesSum : 0;
    this.usersService.updateUser(user.id, {
      trophies: updatedTrophies,
    });
    return yourReward;
  }

  async sendTrophiesToUser(userId: number, amount: number) {
    const user = await this.usersService.findOne(userId);
    const currentTrophies = user.trophies;
    const updatedTrophies = currentTrophies + amount;
    const result = updatedTrophies > 0 ? updatedTrophies : 0;
    this.usersService.updateUser(userId, {
      trophies: result,
    });
  }

  async sendMoneyToUser(userId: number, amount: number) {
    this.usersRepository
      .createQueryBuilder('user')
      .update(User)
      .set({
        money: () => `money + ${String(amount)}`,
      })
      .where('id = :id', { id: userId })
      .execute();
  }

  async registerDailyEventScore(
    userId: number,
    dailyId: number,
    score: number,
  ) {
    const user = await this.usersService.findOne(userId);
    let userDailies = user.dailies ? user.dailies : {};
    userDailies[dailyId] = score;
    this.usersService.updateUser(userId, {
      dailies: userDailies,
    });
    const perfectScore = score === 10;
    const moneyWon = perfectScore ? 20 : score;
    this.sendMoneyToUser(userId, moneyWon);

    let payload = { money: moneyWon };

    if (perfectScore) {
      const reward = await this.rewardUserPerfectDaily(user, dailyId);
      payload['reward'] = reward;
    }

    return payload;
  }

  async rewardUserPerfectDaily(user: User, dailyId: number) {
    const dailyRoom = await this.roomsService.getRoomById(dailyId);
    const { topic } = dailyRoom || {};
    const topicAvatars = await this.getFirebaseStorageFiles(
      `avatars/topics/${topic.toLowerCase()}`,
    );
    const fullUser = await this.usersService.findOne(user.id);
    const currentUserAvatars = fullUser.avatars ? fullUser.avatars : [];
    const avatarToReward = shuffleArray(topicAvatars).find(
      (a) => !currentUserAvatars.includes(a),
    );
    this.usersService.updateUser(user.id, {
      avatars: currentUserAvatars.concat([avatarToReward]),
    });

    return { payload: avatarToReward, type: REWARD_TYPES.AVATAR };
  }

  async getFirebaseStorageFiles(prefix = '') {
    const bucket = await getStorage().bucket().getFiles({ prefix });

    const urls = bucket[0].map((avatar) =>
      createStorageDownloadUrl(
        avatar.name,
        this.configService.get('FIREBASE_TOKEN'),
      ),
    );

    return urls;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  resetDailyEvents() {
    this.usersRepository
      .createQueryBuilder()
      .update(User)
      .set({
        dailies: {},
      })
      .execute();
  }
}
