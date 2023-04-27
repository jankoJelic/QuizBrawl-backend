import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { LobbiesModule } from 'src/lobbies/lobbies.module';
import { LobbiesService } from 'src/lobbies/lobbies.service';

@Module({
  providers: [EventsGateway, LobbiesService],
  imports: [LobbiesModule],
})
export class EventsModule {}
