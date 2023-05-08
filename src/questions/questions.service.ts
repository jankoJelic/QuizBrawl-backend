import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GetQuestionsDto } from './dtos/get-questions.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateQuestionDto } from './dtos/create-question.dto';
import { Repository } from 'typeorm';
import { Question } from './question.entity';
import { User } from 'src/auth/user.entity';
import { UpdateQuestionDto } from './dtos/update-question.dto';
import { UpdateQuestionStatsDto } from './dtos/update-question-stats.dto';
import { CorrectAnswer } from './types/correct-answer.type';
import axios from 'axios';
import { OpenTDBCategory, OpenTDBQuestion } from './dtos/open-tdb.dto';
import { transformToMyTopic } from './util/open-tdb.utils';
import { Difficulty } from './types/difficulty.type';

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
    const questionAlreadyExists = await this.getQuestionByName(
      createQuestionDto.question,
    );

    if (!!questionAlreadyExists)
      throw new ConflictException('Question already exists!');

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

  async getQuestionByName(text: string) {
    const question = this.questionsRepository.find({
      where: { question: text },
    });

    return question;
  }

  async seedDatabaseFromOpenTDB(count: string, user: User) {
    const { data } = await axios.get('https://opentdb.com/api.php', {
      params: { amount: count },
    });

    const { results } = data || {};

    const addQuestionToMyDb = (q: OpenTDBQuestion) => {
      const {
        type,
        correct_answer: correctAnswer,
        incorrect_answers: incorrectAnswers,
        question,
        category,
        difficulty,
      } = q || {};

      if (['Entertainment: Video Games'].includes(type)) return;

      const alphabeticalAnswers = incorrectAnswers
        .concat([q.correct_answer])
        .sort();

      const correctAnswerIndex = alphabeticalAnswers.indexOf(correctAnswer);

      const answersObject = () => {
        switch (correctAnswerIndex) {
          case 0:
            return {
              answer1: correctAnswer,
              correctAnswer: 'answer1' as CorrectAnswer,
              answer3: alphabeticalAnswers[3],
              answer2: alphabeticalAnswers[1],
              answer4: alphabeticalAnswers[2],
            };
          case 1:
            return {
              answer1: alphabeticalAnswers[1],
              correctAnswer: 'answer2' as CorrectAnswer,
              answer3: alphabeticalAnswers[3],
              answer2: correctAnswer,
              answer4: alphabeticalAnswers[2],
            };
          case 2:
            return {
              answer1: alphabeticalAnswers[1],
              correctAnswer: 'answer3' as CorrectAnswer,
              answer3: correctAnswer,
              answer2: alphabeticalAnswers[2],
              answer4: alphabeticalAnswers[3],
            };
          case 3:
            return {
              answer1: alphabeticalAnswers[2],
              correctAnswer: 'answer4' as CorrectAnswer,
              answer3: alphabeticalAnswers[1],
              answer2: alphabeticalAnswers[3],
              answer4: correctAnswer,
            };
        }
      };

      const cleanQuestion = question.replaceAll('&quot;', '');

      console.log(cleanQuestion, category);

      const transformedQuestion: CreateQuestionDto = {
        question: cleanQuestion,
        ...answersObject(),
        topic: transformToMyTopic(category),
        difficulty: difficulty.toUpperCase() as Difficulty,
        user,
      };

      this.questionsRepository.create(transformedQuestion);
      this.questionsRepository.save(transformedQuestion);
    };

    results.forEach((q: OpenTDBQuestion) => {
      addQuestionToMyDb(q);
    });
  }
}
