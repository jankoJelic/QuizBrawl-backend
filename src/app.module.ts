import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from './auth/user.entity';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './mail/mail.module';
import { RoomsModule } from './rooms/rooms.module';
import * as Joi from 'joi';
import { Room } from './rooms/room.entity';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/guards/auth.guard';
import { QuestionsModule } from './questions/questions.module';
import { Question } from './questions/question.entity';
import { ImagesModule } from './images/images.module';
import { Image } from './images/image.entity';

@Global()
@Module({
  imports: [
    AuthModule,
    RoomsModule,
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().required(),
        JWT_EXP: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_REFRESH_EXP: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'jankoKriptomat9',
      database: 'sys',
      entities: [User, Room, Question, Image],
      autoLoadEntities: true,
      synchronize: true,
    }),
    MailModule,
    QuestionsModule,
    ImagesModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
