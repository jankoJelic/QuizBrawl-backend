import { Injectable, NotFoundException } from '@nestjs/common';
import { GetQuestionsDto } from './dtos/get-questions.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateQuestionDto } from './dtos/create-question.dto';
import { Repository } from 'typeorm';
import { Question } from './question.entity';
import { User } from 'src/auth/user.entity';
import { UpdateQuestionDto } from './dtos/update-question.dto';
import { UpdateQuestionStatsDto } from './dtos/update-question-stats.dto';
import { CorrectAnswer } from './types/correct-answer.type';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
  ) {}

  async getQuestions(params: GetQuestionsDto) {
    const { topic, text, count } = params || {};

    let builder = this.questionsRepository
      .createQueryBuilder('questions')
      .orderBy('RAND()')
      .leftJoinAndSelect('questions.user', 'user');

    builder.where('questions.question LIKE :text', { text: `%${text || ''}%` });

    if (topic !== 'General') {
      builder = builder.andWhere('questions.topic LIKE :topic', { topic });
    }

    if (!!count) {
      builder = builder.take(count);
    }

    return await builder.getMany();
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

  async updateQuestionStats(body: UpdateQuestionStatsDto) {
    const ids = Object.keys(body);

    const updateAnswerCount = async (id: number, answer: CorrectAnswer) => {
      const question = await this.getQuestionById(id);

      switch (answer) {
        case 'answer1':
          this.questionsRepository.update(id, {
            answer1Count: question.answer1Count + 1,
          });
          return;
        case 'answer2':
          this.questionsRepository.update(id, {
            answer1Count: question.answer2Count + 1,
          });
          return;
        case 'answer3':
          this.questionsRepository.update(id, {
            answer1Count: question.answer3Count + 1,
          });
          return;
        case 'answer4':
          this.questionsRepository.update(id, {
            answer1Count: question.answer4Count + 1,
          });
          return;
      }
    };

    ids.forEach((id) => {
      const selectedAnswer = body[id];

      updateAnswerCount(Number(id), selectedAnswer);
    });
  }
}
