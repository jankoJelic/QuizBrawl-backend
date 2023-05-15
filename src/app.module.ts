import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from './auth/user.entity';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from './mail/mail.module';
import { RoomsModule } from './rooms/rooms.module';
import * as Joi from 'joi';
import { Room } from './rooms/room.entity';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthGuard } from './auth/guards/auth.guard';
import { QuestionsModule } from './questions/questions.module';
import { Question } from './questions/question.entity';
import { configuration } from '../config/configuration';
import { QuizesModule } from './quizes/quizes.module';
import { Quiz } from './quizes/quiz.entity';
import { LobbiesModule } from './lobbies/lobbies.module';
import { Lobby } from './lobbies/lobby.entity';
import { EventsGateway } from './events/events.gateway';
import { HeaderInterceptor } from './interceptors/headers.interceptor';
import { QuestionsService } from './questions/questions.service';
import { TeamsController } from './teams/teams.controller';
import { TeamsService } from './teams/teams.service';
import { TeamsModule } from './teams/teams.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { MessagesModule } from './messages/messages.module';

@Global()
@Module({
  imports: [
    AuthModule,
    RoomsModule,
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/config/env/${process.env.NODE_ENV}.env`,
      load: [configuration],
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod'),
        JWT_SECRET: Joi.string().required(),
        JWT_EXP: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_REFRESH_EXP: Joi.string().required(),
        GOOGLE_CLIENT_ID: Joi.string().required(),
        GOOGLE_CLIENT_SECRET: Joi.string().required(),
        GOOGLE_REFRESH_TOKEN: Joi.string().required(),
        EMAIL: Joi.string().required(),
        EMAIL_CONFIRMATION_URL: Joi.string().required(),
        BASE_IMAGES_URL: Joi.string().required(),
      }),
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: config.get('THROTTLE_TTL'),
        limit: config.get('THROTTLE_LIMIT'),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [User, Room, Question, Quiz, Lobby],
        autoLoadEntities: true,
        synchronize: true,
      }),
      dataSourceFactory: async (options) => {
        const dataSource = await new DataSource(options).initialize();
        return dataSource;
      },
    }),
    MailModule,
    QuestionsModule,
    QuizesModule,
    LobbiesModule,
    TeamsModule,
    MessagesModule,
  ],
  controllers: [AppController, TeamsController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: AuthGuard },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HeaderInterceptor,
    },
    EventsGateway,
    QuestionsService,
    TeamsService,
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
