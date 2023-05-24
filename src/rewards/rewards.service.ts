import { Injectable } from '@nestjs/common';
import { User } from 'src/auth/user.entity';
import { UsersService } from 'src/auth/users.service';

@Injectable()
export class RewardsService {
  constructor(private usersService: UsersService) {}
  async distributeTrophies(score: Record<number, number>, user: User) {
    const currentUser = await this.usersService.findOne(user.id);
    const currentTrophies = currentUser.trophies;

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

    const distribution = () => {
      switch (playersCount) {
        case 2:
          return [2, -2];
        case 3:
          return [3, 0, -3];
        case 4:
          return [4, 2, -2, -4];
        case 5:
          return [5, 3, 0, -3, -5];
        case 6:
          return [6, 4, 2, -2, -4, -6];
        case 7:
          return [7, 5, 2, 0, -2, -5, -7];
        case 8:
          return [8, 6, 4, 2, -2, -4, -6, -8];
        case 9:
          return [9, 7, 5, 3, 0, -3, -5, -7, -9];
        case 10:
          return [10, 8, 6, 4, 2, -2, -4, -6, -8, -10];
        default:
          return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      }
    };

    let duplicateScoresIndexes = [];
    scoresLargestFirst.forEach((item, index) => {
      if (item === yourScore) duplicateScoresIndexes.push(index);
    });

    const yourReward = () => {
      const multipleUsersWithSameScore = duplicateScoresIndexes.length > 1;

      if (multipleUsersWithSameScore) {
        const averageDistribution =
          duplicateScoresIndexes.reduce((a, b) => a + distribution()[b], 0) /
          duplicateScoresIndexes.length;

        return Math.floor(averageDistribution);
      } else {
        return distribution()[yourPosition];
      }
    };

    const trophiesSum = currentTrophies + yourReward();
    const updatedTrophies = !!trophiesSum ? trophiesSum : 0;

    this,
      this.usersService.updateUser(user.id, {
        trophies: updatedTrophies,
      });

    return yourReward();
  }
}
