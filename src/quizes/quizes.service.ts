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
    let quiz = this.quizesRepository.create(createQuizDto);
    quiz.userId = user.id;

    return await this.quizesRepository.save(quiz);
  }

  async updateQuiz(quizId: number, createQuizDto: CreateQuizDto) {
    return await this.quizesRepository.update(quizId, createQuizDto);
  }

  async getQuizById(id: number) {
    return await this.quizesRepository.findOneBy({ id });
  }

  async deleteQuiz(id: number) {
    this.quizesRepository.delete(id);
  }

  async getQuizesForUser(userId: number) {
    return await this.quizesRepository.find({
      where: { userId },
    });
  }

  async rateQuiz(id: number, like: boolean) {
    const builder = this.quizesRepository
      .createQueryBuilder('quiz')
      .update(Quiz)
      .where('id = :id', { id });

    if (like) {
      builder.set({ likes: () => 'likes + 1' });
      return 'quiz liked';
    } else {
      builder.set({ dislikes: () => 'dislikes + 1' });
      return 'quiz disliked';
    }
  }
}
