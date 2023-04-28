import { Module } from '@nestjs/common';
import { LobbiesController } from './lobbies.controller';
import { LobbiesService } from './lobbies.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lobby } from './lobby.entity';
import { Room } from 'src/rooms/room.entity';
import { UsersService } from 'src/auth/users.service';
import { User } from 'src/auth/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lobby, Room, User])],
  controllers: [LobbiesController],
  providers: [LobbiesService, UsersService],
  exports: [TypeOrmModule, LobbiesService],
})
export class LobbiesModule {}
