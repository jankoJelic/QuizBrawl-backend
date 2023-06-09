import { Reward } from 'src/auth/dtos/reward.dto';
import { LeagueType } from './league.type';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLeagueDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  type: LeagueType;

  @ApiProperty()
  reward?: Reward;

  @ApiProperty()
  bet?: number;

  @ApiProperty()
  password?: string;

  @ApiProperty()
  gameInProgress?: boolean;

  nextQuizUserId?: number;

  gamesPlayed?: Record<number, number>;

  readyUsers?: number[];

  selectedQuizId?: number;
}
