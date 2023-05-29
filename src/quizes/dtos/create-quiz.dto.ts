import { ApiProperty } from '@nestjs/swagger';
import { Question } from 'src/questions/question.entity';
import { Topic } from 'src/rooms/types/Topic';

export class CreateQuizDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  questions: Question[];

  @ApiProperty()
  answerTime: number;

  @ApiProperty()
  topic: Topic;
}
