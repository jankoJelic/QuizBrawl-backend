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
import axios from 'axios';
import { OpenTDBQuestion } from './dtos/open-tdb.dto';
import { transformToMyTopic } from './util/open-tdb.utils';
import { Difficulty } from './types/difficulty.type';
import { decodeHtmlEntities } from 'src/util/decodeHtmlEntities';
import { Room } from 'src/rooms/room.entity';
import { Topic } from 'src/rooms/types/Topic';

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

    if (!!questionAlreadyExists.length) return;

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

  transformAnswers(incorrectAnswers: string[], correctAnswer: string) {
    const alphabeticalAnswers = incorrectAnswers
      .concat([correctAnswer])
      .sort()
      .map((s) => decodeHtmlEntities(s));

    const correctAnswerIndex = alphabeticalAnswers.indexOf(
      decodeHtmlEntities(correctAnswer),
    );

    const answersObject = () => {
      switch (correctAnswerIndex) {
        case 0:
          return {
            answer1: decodeHtmlEntities(correctAnswer),
            correctAnswer: 'answer1' as CorrectAnswer,
            answer3: decodeHtmlEntities(alphabeticalAnswers[3]),
            answer2: decodeHtmlEntities(alphabeticalAnswers[1]),
            answer4: decodeHtmlEntities(alphabeticalAnswers[2]),
          };
        case 1:
          return {
            answer1: decodeHtmlEntities(alphabeticalAnswers[0]),
            answer2: decodeHtmlEntities(correctAnswer),
            correctAnswer: 'answer2' as CorrectAnswer,
            answer3: decodeHtmlEntities(alphabeticalAnswers[3]),
            answer4: decodeHtmlEntities(alphabeticalAnswers[2]),
          };
        case 2:
          return {
            answer1: decodeHtmlEntities(alphabeticalAnswers[0]),
            answer2: decodeHtmlEntities(alphabeticalAnswers[3]),
            answer3: decodeHtmlEntities(correctAnswer),
            correctAnswer: 'answer3' as CorrectAnswer,
            answer4: decodeHtmlEntities(alphabeticalAnswers[1]),
          };
        case 3:
          return {
            answer1: decodeHtmlEntities(alphabeticalAnswers[1]),
            answer3: decodeHtmlEntities(alphabeticalAnswers[2]),
            answer2: decodeHtmlEntities(alphabeticalAnswers[0]),
            answer4: decodeHtmlEntities(correctAnswer),
            correctAnswer: 'answer4' as CorrectAnswer,
          };
      }
    };

    return answersObject;
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

      if (question.includes('game') || question.includes('fast food')) return;
      if (
        category.includes('Games') ||
        category.includes('Japanese') ||
        category.includes('Comics')
      )
        return;
      if (type !== 'multiple') return;
      if (incorrectAnswers.includes(correctAnswer)) return;

      const answersObject = this.transformAnswers(
        incorrectAnswers,
        q.correct_answer,
      );

      const cleanQuestion = decodeHtmlEntities(question);

      const transformedQuestion: CreateQuestionDto = {
        question: decodeHtmlEntities(cleanQuestion),
        ...answersObject(),
        topic: transformToMyTopic(category),
        difficulty: difficulty.toUpperCase() as Difficulty,
        user,
      };

      this.createQuestion(transformedQuestion, user);
    };

    results.forEach((q: OpenTDBQuestion) => {
      addQuestionToMyDb(q);
    });
  }

  async getQuestionsForRoom(room: Room) {
    return await this.getQuestions({
      count: room.questionsCount,
      topic: room.topic,
    });
  }

  async likeQuestion(questionId: number, like: boolean) {
    const builder = this.questionsRepository
      .createQueryBuilder()
      .update(Question)
      .where({ id: questionId });

    if (like) {
      builder.set({
        likes: () => `likes + 1`,
      });
    } else {
      builder.set({ dislikes: () => 'dislikes + 1' });
    }

    builder.execute();
  }

  mapTriviaQuestionCategory(category: TriviaQuestionCategory) {
    switch (category) {
      case 'music':
        return 'Music';
      case 'food_and_drink':
      case 'society_and_culture':
      case 'general_knowledge':
        return 'General';
      case 'film_and_tv':
        return 'Showbiz';
      case 'geography':
        return 'Geography';
      case 'history':
        return 'History';
      case 'sport_and_leisure':
        return 'Sports';
      case 'science':
        return 'Science';
      case 'arts_and_literature':
        return 'Art';
    }
  }

  async seedDbFromTriviaApi(user: User) {
    const { data } = await axios.get<TriviaApiQuestion[]>(
      'https://the-trivia-api.com/v2/questions/',
    );

    const addTriviaQuestionToDb = (q: TriviaApiQuestion) => {
      const answersObject = this.transformAnswers(
        q.incorrectAnswers,
        q.correctAnswer,
      );

      const transformedQuestion: CreateQuestionDto = {
        difficulty: q.difficulty?.toUpperCase() as Difficulty,
        topic: this.mapTriviaQuestionCategory(q.category),
        ...answersObject(),
        user,
        question: q.question.text,
      };

      this.createQuestion(transformedQuestion, user);
    };

    data.forEach(addTriviaQuestionToDb);

    return data;
  }
}

type TriviaQuestionCategory =
  | 'food_and_drink'
  | 'music'
  | 'film_and_tv'
  | 'history'
  | 'geography'
  | 'sport_and_leisure'
  | 'society_and_culture'
  | 'general_knowledge'
  | 'arts_and_literature'
  | 'science';

interface TriviaApiQuestion {
  category: TriviaQuestionCategory;
  id: string;
  correctAnswer: string;
  incorrectAnswers: string[];
  question: {
    text: string;
  };
  tags: string[];
  type: 'text_choice';
  difficulty: Difficulty;
  regions: [];
  isNiche: boolean;
}
