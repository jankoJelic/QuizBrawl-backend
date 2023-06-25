import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/auth/user.entity';
import { MessagesService } from './messages.service';
import { UsersService } from 'src/auth/users.service';
import { MessageType } from './dtos/message.dto';

@Controller('messages')
export class MessagesController {
  constructor(
    private messagesService: MessagesService,
    private usersService: UsersService,
  ) {}

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
  async deleteMessage(@Query('id') id: string) {
    return await this.messagesService.deleteMessage(Number(id));
  }

  @Get('/message/read')
  readMessage(@Query('id') id: string) {
    this.messagesService.readMessage(Number(id));
  }

  @Post('/message')
  async sendMessage(@Body() body: SendMessageBody) {
    const recipient = await this.usersService.findOne(body.recipientId);
    this.messagesService.sendNotification({
      title: body.title,
      token: recipient.fcmToken,
      text: body.text,
      data: body.data,
    });
  }
}

interface SendMessageBody {
  title: string;
  recipientId: number;
  text: string;
  data: { type: MessageType; payload: string };
}
