import { Module } from '@nestjs/common';
import { RewardsController } from './rewards.controller';
import { RewardsService } from './rewards.service';
import { UsersService } from 'src/auth/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/auth/user.entity';
import { LobbiesService } from 'src/lobbies/lobbies.service';
import { LobbiesModule } from 'src/lobbies/lobbies.module';

@Module({
  controllers: [RewardsController],
  providers: [RewardsService, UsersService, LobbiesService],
  imports: [TypeOrmModule.forFeature([User]), LobbiesModule],
  exports: [TypeOrmModule, RewardsService],
})
export class RewardsModule {}
