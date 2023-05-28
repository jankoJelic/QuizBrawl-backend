import { ApiProperty } from '@nestjs/swagger';

export class RegisterDailyEventScore {
  @ApiProperty()
  dailyId: number;

  @ApiProperty()
  score: number;
}
