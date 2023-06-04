import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateQuizDto } from './dtos/create-quiz.dto';
import { QuizesService } from './quizes.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/auth/user.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('quizes')
@Controller('quizes')
export class QuizesController {
  constructor(private quizesService: QuizesService) {}

  @Get('/league/:id')
  async getQuizes(@Param('id') leagueId: string) {
    return await this.quizesService.getQuizesForLeague(Number(leagueId));
  }

  @Post('/create')
  async createQuiz(
    @CurrentUser() user: User,
    @Body() createQuizDto: CreateQuizDto,
  ) {
    return await this.quizesService.createQuiz(user, createQuizDto);
  }

  @Patch('/quiz/:id')
  async updateQuiz(@Param('id') id: string, @Body() body: CreateQuizDto) {
    await this.quizesService.updateQuiz(Number(id), body);
    return { ...body, id: Number(id) };
  }

  @Get('/my')
  async getMyQuizes(@CurrentUser() user: User) {
    return await this.quizesService.getQuizesForUser(user.id);
  }

  @Patch('/quiz/:id/rate')
  async rateQuiz(@Param('id') id: string, body: { like: boolean }) {
    return await this.quizesService.rateQuiz(Number(id), body.like);
  }

  @Delete('/quiz/:id')
  async deleteQuiz(@Param('id') id: string) {
    return await this.quizesService.deleteQuiz(Number(id));
  }
}
