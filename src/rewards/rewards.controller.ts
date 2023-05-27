import { Body, Controller, Post } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/auth/user.entity';

@Controller('rewards')
export class RewardsController {
  constructor(private rewardsService: RewardsService) {}
  @Post('/arena/score')
  async distributeArenaTrophies(
    @Body() body: Record<number, number>,
    @CurrentUser() user: User,
  ) {
    return await this.rewardsService.distributeTrophies(body, user);
  }

  @Post('/solo/daily')
  async registerDailyEventScore(
    @CurrentUser() user: User,
    @Body() body: { dailyId: number; score: number },
  ) {
    return await this.rewardsService.registerDailyEventScore(
      user.id,
      body.dailyId,
      body.score,
    );
  }
}
