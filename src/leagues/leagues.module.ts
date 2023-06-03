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
import { RewardsModule } from 'src/rewards/rewards.module';
import { RoomsModule } from 'src/rooms/rooms.module';

@Module({
  controllers: [LeaguesController],
  providers: [
    LeaguesService,
    UsersService,
    MessagesService,
    RewardsService,
    ConfigService,
  ],
  imports: [TypeOrmModule.forFeature([League, User, Lobby, Room]), RoomsModule],
})
export class LeaguesModule {}
