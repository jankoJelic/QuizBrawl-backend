import { Module } from '@nestjs/common';
import { LobbiesController } from './lobbies.controller';
import { LobbiesService } from './lobbies.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lobby } from './lobby.entity';
import { Room } from 'src/rooms/room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lobby, Room])],
  controllers: [LobbiesController],
  providers: [LobbiesService],
  exports: [TypeOrmModule, LobbiesService],
})
export class LobbiesModule {}
