import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './room.entity';
import { Lobby } from 'src/lobbies/lobby.entity';
@Module({
  controllers: [RoomsController],
  providers: [RoomsService],
  imports: [TypeOrmModule.forFeature([Room, Lobby])],
  exports: [TypeOrmModule],
})
export class RoomsModule {}
