import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { LobbiesModule } from 'src/lobbies/lobbies.module';
import { LobbiesService } from 'src/lobbies/lobbies.service';
import { UsersService } from 'src/auth/users.service';
import { AuthModule } from 'src/auth/auth.module';
import { RoomsService } from 'src/rooms/rooms.service';
import { RoomsModule } from 'src/rooms/rooms.module';

@Module({
  providers: [EventsGateway, UsersService, LobbiesService, RoomsService],
  imports: [AuthModule, LobbiesModule, RoomsModule],
})
export class EventsModule {}
