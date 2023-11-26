import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/auth/user.entity';
import { RegisterDailyEventScore } from './dtos/register-daily-score.dto';
import { MultiPlayerScore } from './dtos/multi-player-score.dto';
import { RegisterCashGameScoreDto } from './dtos/register-cash-game-score.dto';
import { UsersService } from 'src/auth/users.service';

@Controller('rewards')
export class RewardsController {
  constructor(
    private rewardsService: RewardsService,
    private usersService: UsersService,
  ) {}
  @Post('/arena/score')
  async distributeArenaTrophies(
    @Body() body: MultiPlayerScore,
    @CurrentUser() user: User,
  ) {
    Object.keys(body)
      .filter((id) => Number(user.id) !== Number(id))
      .forEach(async (u) => {
        const anotherUser = await this.usersService.findOne(Number(u));
        if (anotherUser.isBot) {
          this.rewardsService.distributeTrophies(body, anotherUser);
        }
      });
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
    return this.rewardsService.makePurchase(user, type, body.payload);
  }
}

export type MarketProductType = 'avatar';
