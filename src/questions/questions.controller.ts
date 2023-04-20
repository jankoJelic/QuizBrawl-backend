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
import { Topic } from 'src/rooms/types/Topic';
import { GetQuestionsDto } from './dtos/get-questions.dto';
import { CreateQuestionDto } from './dtos/create-question.dto';

@ApiTags('questions')
@UseGuards(AdminGuard)
@Controller('questions')
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  @Post('/create')
  async createQuestion(@Body() createQuestionDto: CreateQuestionDto) {
    return this.questionsService.createQuestion(createQuestionDto);
  }

  @Patch('/editQuestion')
  async editQuestion() {}

  @Delete('/deleteQuestion')
  async deleteQuestion() {}

  @Get('/')
  async getQuestions(
    @Query()
    params: GetQuestionsDto,
  ) {
    return await this.questionsService.getQuestions(params);
  }
}
