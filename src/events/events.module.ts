import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { LobbiesModule } from 'src/lobbies/lobbies.module';
import { LobbiesService } from 'src/lobbies/lobbies.service';
import { UsersService } from 'src/auth/users.service';
import { AuthModule } from 'src/auth/auth.module';
import { RoomsService } from 'src/rooms/rooms.service';
import { RoomsModule } from 'src/rooms/rooms.module';
import { QuestionsService } from 'src/questions/questions.service';
import { QuestionsModule } from 'src/questions/questions.module';
import { MessagesModule } from 'src/messages/messages.module';
import { MessagesService } from 'src/messages/messages.service';

@Module({
  providers: [
    EventsGateway,
    UsersService,
    LobbiesService,
    RoomsService,
    QuestionsService,
    MessagesService,
  ],
  imports: [
    AuthModule,
    LobbiesModule,
    RoomsModule,
    QuestionsModule,
    MessagesModule,
  ],
})
export class EventsModule {}
