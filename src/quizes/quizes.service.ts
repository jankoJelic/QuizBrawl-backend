import { Injectable } from '@nestjs/common';
import { User } from 'src/auth/user.entity';
import { CreateQuizDto } from './dtos/create-quiz.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz } from './quiz.entity';

@Injectable()
export class QuizesService {
  constructor(
    @InjectRepository(Quiz)
    private quizesRepository: Repository<Quiz>,
  ) {}
  async createQuiz(user: User, createQuizDto: CreateQuizDto) {
    const quiz = this.quizesRepository.create(createQuizDto);
    quiz.user = user;

    return await this.quizesRepository.save(quiz);
  }

  async updateQuiz(
    quizId: string,
    createQuizDto: CreateQuizDto,
    userId: number,
  ) {}

  async getQuizById(id: number) {
    return await this.quizesRepository.findOneBy({ id });
  }

  async deleteQuiz(id: number) {
    this.quizesRepository.delete(id);
  }

  async getQuizesForUser(userId: number) {
    return await this.quizesRepository.find({ where: { user } });
  }
}
