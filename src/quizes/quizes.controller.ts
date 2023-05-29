import { Body, Controller, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { CreateQuizDto } from './dtos/create-quiz.dto';
import { QuizesService } from './quizes.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/auth/user.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('quizes')
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

  @Patch('/quiz/:id')
  async updateQuiz(@Param('id') id: string, @Body() body: CreateQuizDto) {
    return await this.quizesService.updateQuiz(Number(id), body);
  }

  @Get('/')
  async getMyQuizes(@CurrentUser() user: User) {
    return await this.quizesService.getQuizesForUser(user.id);
  }

  @Patch('/quiz/:id/rate')
  async rateQuiz(@Param('id') id: string, body: { like: boolean }) {
    return await this.quizesService.rateQuiz(Number(id), body.like);
  }
}
