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
import { GetQuestionsDto } from './dtos/get-questions.dto';
import { CreateQuestionDto } from './dtos/create-question.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/auth/user.entity';
import { Topic } from 'src/rooms/types/Topic';
import { Difficulty } from './types/difficulty.type';

@ApiTags('questions')
@UseGuards(AdminGuard)
@Controller('questions')
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  @Post('/create')
  async createQuestion(
    @Body() createQuestionDto: CreateQuestionDto,
    @CurrentUser() user: User,
  ) {
    return this.questionsService.createQuestion(createQuestionDto, user);
  }

  @Patch('/edit')
  async editQuestion(
    @Query('id') id: number,
    @Body() body: CreateQuestionDto,
    @CurrentUser() user: User,
  ) {
    return await this.questionsService.updateQuestion({ id, dto: body, user });
  }

  @Delete('/')
  async deleteQuestion(@Query('id') id: number) {
    return await this.questionsService.deleteQuestion(id);
  }

  @Get('/')
  async getQuestions(
    @Query('topic') topic: Topic,
    @Query('difficulty') difficulty: Difficulty,
    @Query('text') text: string,
  ) {
    return await this.questionsService.getQuestions({
      topic,
      difficulty,
      text,
    });
  }

  @Get('/question')
  async getQuestion(@Query('id') id: string) {
    return await this.questionsService.getQuestionById(Number(id));
  }
}
