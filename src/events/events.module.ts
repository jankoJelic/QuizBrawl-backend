import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { LobbiesModule } from 'src/lobbies/lobbies.module';
import { LobbiesService } from 'src/lobbies/lobbies.service';
import { UsersService } from 'src/auth/users.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [EventsGateway, UsersService, LobbiesService],
  imports: [AuthModule, LobbiesModule],
})
export class EventsModule {}
