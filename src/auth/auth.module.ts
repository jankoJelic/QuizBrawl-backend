import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { AuthController } from './auth.controller';
import { UsersService } from './users.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JWT_EXP, JWT_SECRET } from './constants/authConstants';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { MailModule } from 'src/mail/mail.module';
import { LobbiesModule } from 'src/lobbies/lobbies.module';

const jwtFactory = {
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    secret: configService.get(JWT_SECRET),
    signOptions: {
      expiresIn: configService.get(JWT_EXP),
    },
  }),
  inject: [ConfigService],
};

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync(jwtFactory),
    MailModule,
    LobbiesModule,
  ],
  controllers: [AuthController],
  providers: [
    UsersService,
    AuthService,
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
  exports: [TypeOrmModule, JwtModule, UsersService],
})
export class AuthModule {}
