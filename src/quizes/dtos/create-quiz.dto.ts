import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/auth/user.entity';
import { Question } from 'src/questions/question.entity';

export class CreateQuizDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  questions: Question[];

  @ApiProperty()
  answerTime: number;
}
