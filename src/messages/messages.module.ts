import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/auth/user.entity';

@Module({
  controllers: [MessagesController],
  providers: [MessagesService],
  imports: [AuthModule, TypeOrmModule.forFeature([User])],
  exports: [TypeOrmModule, MessagesService],
})
export class MessagesModule {}
