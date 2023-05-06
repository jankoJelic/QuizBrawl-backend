import { Injectable, NotFoundException } from '@nestjs/common';
import { GetQuestionsDto } from './dtos/get-questions.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateQuestionDto } from './dtos/create-question.dto';
import { Repository } from 'typeorm';
import { Question } from './question.entity';
import { User } from 'src/auth/user.entity';
import { UpdateQuestionDto } from './dtos/update-question.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
  ) {}

  async getQuestions(params: GetQuestionsDto) {
    const { topic, text, difficulty, count } = params || {};

    let builder = this.questionsRepository
      .createQueryBuilder('questions')
      .orderBy('RAND()');

    builder.leftJoinAndSelect('questions.user', 'user');

    builder.where('questions.question LIKE :text', { text: `%${text}%` });

    if (topic !== 'General') {
      builder = builder.andWhere('questions.topic LIKE :topic', { topic });
    }

    if (!!count) {
      builder = builder.take(count);
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

  async updateQuestion({ dto, id, user }: UpdateQuestionDto) {
    const question = await this.questionsRepository.findOne({ where: { id } });

    if (!question) throw new NotFoundException();

    const isEdited = !!question.editedBy;
    const updatedEditors = isEdited ? question.editedBy.concat([user]) : [user];
    return await this.questionsRepository.update(id, {
      ...dto,
      editedBy: updatedEditors,
    });
  }

  async deleteQuestion(questionId: number) {
    return await this.questionsRepository.delete(questionId);
  }

  async getQuestionById(id: number) {
    const q = await this.questionsRepository.findOneBy({ id });
    return q;
  }
}
