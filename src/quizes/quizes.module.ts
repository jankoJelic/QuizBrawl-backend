import { Module } from '@nestjs/common';
import { QuizesController } from './quizes.controller';
import { QuizesService } from './quizes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from './quiz.entity';
import { LeaguesService } from 'src/leagues/leagues.service';
import { League } from 'src/leagues/league.entity';
import { RewardsService } from 'src/rewards/rewards.service';
import { UsersService } from 'src/auth/users.service';
import { Room } from 'src/rooms/room.entity';
import { User } from 'src/auth/user.entity';
import { RoomsService } from 'src/rooms/rooms.service';
import { Lobby } from 'src/lobbies/lobby.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, League, Room, User, Lobby])],
  controllers: [QuizesController],
  providers: [
    QuizesService,
    LeaguesService,
    RewardsService,
    UsersService,
    RoomsService,
  ],
  exports: [TypeOrmModule, QuizesService],
})
export class QuizesModule {}
