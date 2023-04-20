import { Module } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './question.entity';
import { ImagesModule } from 'src/images/images.module';

@Module({
  imports: [TypeOrmModule.forFeature([Question]), ImagesModule],
  providers: [QuestionsService],
  controllers: [QuestionsController],
  exports: [TypeOrmModule],
})
export class QuestionsModule {}
