import { Module } from '@nestjs/common';
import { LeaguesController } from './leagues.controller';
import { LeaguesService } from './leagues.service';
import { UsersService } from 'src/auth/users.service';
import { MessagesService } from 'src/messages/messages.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { League } from './league.entity';
import { User } from 'src/auth/user.entity';
import { Lobby } from 'src/lobbies/lobby.entity';
import { Room } from 'src/rooms/room.entity';
import { RewardsService } from 'src/rewards/rewards.service';
import { ConfigService } from '@nestjs/config';
import { RoomsModule } from 'src/rooms/rooms.module';
import { Message } from 'src/messages/message.entity';

@Module({
  controllers: [LeaguesController],
  providers: [
    LeaguesService,
    UsersService,
    MessagesService,
    RewardsService,
    ConfigService,
  ],
  imports: [
    TypeOrmModule.forFeature([League, User, Lobby, Room, Message]),
    RoomsModule,
  ],
})
export class LeaguesModule {}
