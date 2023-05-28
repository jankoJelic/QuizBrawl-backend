import { ApiProperty } from '@nestjs/swagger';
import { MultiPlayerScore } from './multi-player-score.dto';

export class RegisterCashGameScoreDto {
  @ApiProperty()
  score: MultiPlayerScore;

  @ApiProperty()
  roomId: number;
}
