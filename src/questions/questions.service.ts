import { Injectable } from '@nestjs/common';
import { GetQuestionsDto } from './dtos/get-questions.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateQuestionDto } from './dtos/create-question.dto';
import { Repository } from 'typeorm'; 
import { Question } from './question.entity';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
  ) {}

  async getQuestions(params: GetQuestionsDto) {
    const {topic, length} = params || {}
  }

  async createQuestion(createQuestionDto: CreateQuestionDto) {
    const question = this.questionsRepository.create(createQuestionDto);

    return await this.questionsRepository.save(question);
  }

  async updateQuestion(dto: Partial<CreateQuestionDto>) {}

  async deleteQuestion(questionId: number) {}
}
