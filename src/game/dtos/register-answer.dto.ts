import { ApiProperty } from '@nestjs/swagger';
import { Topic } from 'src/rooms/types/Topic';

export class RegisterAnswerDto {
  @ApiProperty()
  correct: boolean;

  @ApiProperty()
  topic: Topic;
}
