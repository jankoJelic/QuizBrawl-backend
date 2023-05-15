import { Controller, Get, Post, Query } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/auth/user.entity';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  // @Post('/friendRequest')
  // async handleFriendRequestSent(
  //   @CurrentUser() user: User,
  //   @Query('userId') userId: string,
  // ) {
  //   return await this.messagesService.sendFriendRequest(user, Number(userId));
  // }

  @Get('/fcmToken')
  async connectToFCM(
    @Query('fcmToken') fcmToken: string,
    @CurrentUser() user: User,
  ) {
    return await this.messagesService.connectToFCM(fcmToken, user.id);
  }
}
