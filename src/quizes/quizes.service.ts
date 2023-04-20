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
    return await this.quizesRepository.save({ ...createQuizDto, user });
  }
}
