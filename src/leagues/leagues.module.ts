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

@Module({
  controllers: [LeaguesController],
  providers: [LeaguesService, UsersService, MessagesService],
  imports: [TypeOrmModule.forFeature([League, User, Lobby, Room])],
})
export class LeaguesModule {}
