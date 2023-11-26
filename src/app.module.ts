import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from './mail/mail.module';
import { RoomsModule } from './rooms/rooms.module';
import * as Joi from 'joi';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthGuard } from './auth/guards/auth.guard';
import { QuestionsModule } from './questions/questions.module';
import { configuration } from '../config/configuration';
import { QuizesModule } from './quizes/quizes.module';
import { LobbiesModule } from './lobbies/lobbies.module';
import { EventsGateway } from './events/events.gateway';
import { HeaderInterceptor } from './interceptors/headers.interceptor';
import { QuestionsService } from './questions/questions.service';
import { TeamsController } from './teams/teams.controller';
import { TeamsService } from './teams/teams.service';
import { TeamsModule } from './teams/teams.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { MessagesModule } from './messages/messages.module';
import { MessagesService } from './messages/messages.service';
import { AllExceptionsFilter } from './interceptors/htttp-exception.filter';
import { RewardsModule } from './rewards/rewards.module';
import { MarketModule } from './market/market.module';
import { RoomsGateway } from './events/gateways/rooms.gateway';
import { LobbiesGateway } from './events/gateways/lobbies.gateway';
import { GameGateway } from './events/gateways/game.gateway';
import { MessagesGateway } from './events/gateways/messages.gateway';
import { GameModule } from './game/game.module';
import { ScheduleModule } from '@nestjs/schedule';
import { LeaguesModule } from './leagues/leagues.module';
import { RewardsService } from './rewards/rewards.service';
import { LeaguesService } from './leagues/leagues.service';
import { QuizesService } from './quizes/quizes.service';
import { LeaguesGateway } from './events/gateways/leagues.gateway';
import { PagesModule } from './pages/pages.module';

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
    ScheduleModule.forRoot(),
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
        entities: ['dist/**/*.entity{.ts,.js}'],
        autoLoadEntities: true,
        synchronize: false,
        migrations: ['src/migrations/**/*{.ts,.js}'],
        migrationsTableName: 'custom_migration_table',
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
    RewardsModule,
    MarketModule,
    GameModule,
    LeaguesModule,
    PagesModule,
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
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    EventsGateway,
    RoomsGateway,
    LobbiesGateway,
    GameGateway,
    MessagesGateway,
    LeaguesGateway,
    QuestionsService,
    TeamsService,
    MessagesService,
    RewardsService,
    LeaguesService,
    QuizesService,
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
