import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/auth/user.entity';
import { RegisterDailyEventScore } from './dtos/register-daily-score.dto';
import { MultiPlayerScore } from './dtos/multi-player-score.dto';
import { RegisterCashGameScoreDto } from './dtos/register-cash-game-score.dto';

@Controller('rewards')
export class RewardsController {
  constructor(private rewardsService: RewardsService) {}
  @Post('/arena/score')
  async distributeArenaTrophies(
    @Body() body: MultiPlayerScore,
    @CurrentUser() user: User,
  ) {
    return await this.rewardsService.distributeTrophies(body, user);
  }

  @Post('/solo/daily')
  async registerDailyEventScore(
    @CurrentUser() user: User,
    @Body() body: RegisterDailyEventScore,
  ) {
    return await this.rewardsService.registerDailyEventScore(
      user.id,
      body.dailyId,
      body.score,
    );
  }

  @Post('/cash/score')
  async registerCashGameScore(
    @CurrentUser() user: User,
    @Body() body: RegisterCashGameScoreDto,
  ) {
    return await this.rewardsService.distributeCashGamePrizes(
      body.score,
      user,
      body.roomId,
    );
  }

  @Get('/market')
  async getMarket() {
    return await this.rewardsService.getMarket();
  }

  @Post('/market/buy/:type')
  async buyAvatar(
    @CurrentUser() user: User,
    @Param('type') type: MarketProductType,
    @Body() body: { payload: any },
  ) {
    return this.rewardsService.makePurchase(user, type, body.payload)
  }
}

export type MarketProductType = 'avatar';
