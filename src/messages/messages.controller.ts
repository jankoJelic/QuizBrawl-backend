import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/auth/user.entity';
import { MessagesService } from './messages.service';
import { Message } from './dtos/message.dto';

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

  @Delete('/message')
  async deleteMessage(@CurrentUser() user: User, @Query('id') id: string) {
    return await this.messagesService.deleteMessage(user.id, id);
  }

  @Patch('/friendRequest')
  async patchFriendRequest(
    @CurrentUser() user: User,

    @Body() body: { response: boolean; message: Message },
  ) {
    return await this.messagesService.respondToFriendRequest(
      user,
      body.message,
      body.response,
    );
  }
}
