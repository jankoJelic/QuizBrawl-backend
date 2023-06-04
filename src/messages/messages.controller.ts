import { Controller, Delete, Get, Query } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/auth/user.entity';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get('/')
  async getMyMessages(@CurrentUser() user: User) {
    return await this.messagesService.getMyMessages(user.id);
  }

  @Get('/fcmToken')
  async connectToFCM(
    @Query('fcmToken') fcmToken: string,
    @CurrentUser() user: User,
  ) {
    return await this.messagesService.connectToFCM(fcmToken, user.id);
  }

  @Delete('/message')
  async deleteMessage(@CurrentUser() user: User, @Query('id') id: string) {
    return await this.messagesService.deleteMessage(Number(id));
  }

  @Get('/message/read')
  readMessage(@Query('id') id: string) {
    this.messagesService.readMessage(Number(id));
  }
}
