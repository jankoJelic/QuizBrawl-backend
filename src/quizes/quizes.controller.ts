import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
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

  @Patch('/update')
  async updateQuiz(
    @CurrentUser() user: User,
    @Query() quizId: string,
    @Body() updateQuizDto: CreateQuizDto,
  ) {
    return await this.quizesService.updateQuiz(quizId, updateQuizDto, user.id);
  }

  @Get('/my')
  async getMyQuizes(@CurrentUser() user: User) {
    return await this.quizesService.getQuizesForUser(user.id)
  }
}
