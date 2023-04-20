import { Body, Controller, Post } from '@nestjs/common';
import { CreateQuizDto } from './dtos/create-quiz.dto';
import { QuizesService } from './quizes.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/auth/user.entity';

@Controller('quizes')
export class QuizesController {
  constructor(private quizesService: QuizesService) {}

  @Post('/create')
  async createQuiz(
    @CurrentUser() user: User,
    @Body() createQuizDto: CreateQuizDto,
  ) {
    return await this.quizesService.createQuiz(user, createQuizDto);
  }
}
