import { Injectable } from '@nestjs/common';
import { GetQuestionsDto } from './dtos/get-questions.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateQuestionDto } from './dtos/create-question.dto';
import { Repository } from 'typeorm';
import { Question } from './question.entity';
import { User } from 'src/auth/user.entity';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
  ) {}

  async getQuestions(params: GetQuestionsDto) {
    const { topic, text, difficulty } = params || {};

    const builder = this.questionsRepository.createQueryBuilder('questions');
    builder.leftJoinAndSelect('questions.user', 'user');
    if (topic !== 'General') {
      builder.where('questions.topic LIKE :topic', { topic });
    }
    return builder.getMany();
  }

  async createQuestion(createQuestionDto: CreateQuestionDto, user: User) {
    const question = this.questionsRepository.create({
      ...createQuestionDto,
      user,
    });

    return await this.questionsRepository.save(question);
  }

  async updateQuestion(dto: Partial<CreateQuestionDto>) {}

  async deleteQuestion(questionId: number) {
    return await this.questionsRepository.delete(questionId);
  }

  async getQuestionById(id: number) {
    const q = await this.questionsRepository.findOneBy({ id });
    return q;
  }
}
