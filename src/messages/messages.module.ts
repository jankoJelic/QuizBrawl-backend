import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/auth/user.entity';
import { Message } from './message.entity';
import { LeaguesService } from 'src/leagues/leagues.service';
import { League } from 'src/leagues/league.entity';
import { LeaguesModule } from 'src/leagues/leagues.module';
import { RewardsService } from 'src/rewards/rewards.service';
import { RoomsService } from 'src/rooms/rooms.service';
import { Room } from 'src/rooms/room.entity';

@Module({
  controllers: [MessagesController],
  providers: [MessagesService, LeaguesService, RewardsService, RoomsService],
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Message, User, League, Room]),
    LeaguesModule,
  ],
  exports: [TypeOrmModule.forFeature([Message]), MessagesService],
})
export class MessagesModule {}
