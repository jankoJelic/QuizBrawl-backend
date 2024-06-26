import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { ApiTags } from '@nestjs/swagger';
import { CreateQuestionDto } from './dtos/create-question.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/auth/user.entity';
import { Topic } from 'src/rooms/types/Topic';
import { Difficulty } from './types/difficulty.type';
import { UpdateQuestionStatsDto } from './dtos/update-question-stats.dto';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@ApiTags('questions')
@Controller('questions')
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  @UseGuards(AdminGuard)
  @Post('/create')
  async createQuestion(
    @Body() createQuestionDto: CreateQuestionDto,
    @CurrentUser() user: User,
  ) {
    return this.questionsService.createQuestion(createQuestionDto, user);
  }

  @UseGuards(AdminGuard)
  @Patch('/edit')
  async editQuestion(
    @Query('id') id: number,
    @Body() body: CreateQuestionDto,
    @CurrentUser() user: User,
  ) {
    return await this.questionsService.updateQuestion({ id, dto: body, user });
  }

  @UseGuards(AdminGuard)
  @Delete('/')
  async deleteQuestion(@Query('id') id: number) {
    return await this.questionsService.deleteQuestion(id);
  }

  @Get('/')
  async getQuestions(
    @Query('topic') topic: Topic,
    @Query('difficulty') difficulty: Difficulty,
    @Query('text') text: string,
    @Query('count') count: string,
  ) {
    const countNumber = Number(count);
    return await this.questionsService.getQuestions({
      topic,
      difficulty,
      text,
      count: countNumber,
    });
  }

  @UseGuards(AdminGuard)
  @Get('/question')
  async getQuestion(@Query('id') id: string) {
    return await this.questionsService.getQuestionById(Number(id));
  }

  @Post('/question/like')
  async likeQuestion(@Body() body: { like: boolean; id: number }) {
    return await this.questionsService.likeQuestion(Number(body.id), body.like);
  }

  @Patch('/stats')
  async updateQuestionStats(@Body() body: UpdateQuestionStatsDto) {
    if (!body) return;
    this.questionsService.updateQuestionStats(body);
  }

  @UseGuards(AdminGuard)
  @Get('/opentdb')
  async seedDatabaseFromOpenDb(
    @Query('count') count: string,
    @CurrentUser() user: User,
  ) {
    return await this.questionsService.seedDatabaseFromOpenTDB(count, user);
  }

  @Get('/triviaapi')
  async seedDbFromTriviaApi(@CurrentUser() user: User) {
    return await this.questionsService.seedDbFromTriviaApi(user);
  }
}
