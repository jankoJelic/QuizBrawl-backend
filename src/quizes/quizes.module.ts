import { Module } from '@nestjs/common';
import { QuizesController } from './quizes.controller';
import { QuizesService } from './quizes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from './quiz.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz])],
  controllers: [QuizesController],
  providers: [QuizesService],
  exports: [TypeOrmModule],
})
export class QuizesModule {}
