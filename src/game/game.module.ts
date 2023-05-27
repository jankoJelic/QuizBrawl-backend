import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { QuestionsService } from 'src/questions/questions.service';
import { QuestionsModule } from 'src/questions/questions.module';
import { UsersService } from 'src/auth/users.service';
import { AuthModule } from 'src/auth/auth.module';
import { RoomsModule } from 'src/rooms/rooms.module';
import { RoomsService } from 'src/rooms/rooms.service';

@Module({
  controllers: [GameController],
  providers: [GameService, QuestionsService, UsersService, RoomsService],
  imports: [QuestionsModule, AuthModule, RoomsModule],
})
export class GameModule {}
