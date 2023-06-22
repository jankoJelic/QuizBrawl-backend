import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/auth/user.entity';
import { CreateQuizDto } from './dtos/create-quiz.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Quiz } from './quiz.entity';
import { LeaguesService } from 'src/leagues/leagues.service';
import { getStorage } from 'firebase-admin/storage';

@Injectable()
export class QuizesService {
  constructor(
    @InjectRepository(Quiz)
    private quizesRepository: Repository<Quiz>,
    private leaguesService: LeaguesService,
  ) {}
  async getQuizesForLeague(leagueId: number) {
    const league = await this.leaguesService.getLeagueById(leagueId);

    if (!league?.quizIds) return [];
    return await this.quizesRepository.find({
      where: { id: In(league.quizIds) },
    });
  }

  async createQuiz(user: User, createQuizDto: CreateQuizDto) {
    let quiz = this.quizesRepository.create(createQuizDto);
    quiz.userId = user.id;

    return await this.quizesRepository.save(quiz);
  }

  async updateQuiz(quizId: number, createQuizDto: CreateQuizDto) {
    await this.quizesRepository.update(quizId, createQuizDto);
    return createQuizDto;
  }

  async getQuizById(id: number) {
    return await this.quizesRepository.findOneBy({ id });
  }

  async deleteQuiz(id: number, userId: number) {
    const quiz = await this.getQuizById(id);
    if (quiz.userId !== userId) throw new UnauthorizedException();

    const usedImages = quiz.questions
      .map((q) => (q.image ? q.image : null))
      .filter((img) => !!img);

    if (usedImages.length) {
      const bucket = getStorage().bucket();
      usedImages.forEach((img) => {
        const imgFile = bucket.file('customQuizzes/' + img);
        imgFile.delete();
      });
    }

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
    } else {
      builder.set({ dislikes: () => 'dislikes + 1' });
    }

    builder.execute();
  }
}
