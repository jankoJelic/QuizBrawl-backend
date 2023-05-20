import {
  HttpException,
  HttpStatus,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { Message } from 'src/messages/dtos/message.dto';
import { User } from 'src/auth/user.entity';
import { UsersService } from 'src/auth/users.service';
import admin from 'firebase-admin';
import { createFriendRequest } from './util/create-friend-request';

const jankosToken =
  'c8rpPv3URoO1tshuI60Sqt:APA91bHOek1ojK8oUlX5a8yk594RK2Qpf-_Eo2XEFddw9uT_bscRxak7EjKix2w8p-V4S49lJH_Hi1--aDMYS8qi9n2CLWDBtB3LA88alGSZ-H8MOfKytM57UgGo3uQq-xfA9sgevLqf';

@Injectable()
export class MessagesService {
  constructor(private usersService: UsersService) {}

  sendNotification({ data, title, text, token = jankosToken }) {
    admin.messaging().send({
      // token: recipient.fcmToken,
      // hardcoded my phone for testing, needs to be equal to recipient?.fcmToken
      token,
      data,
      notification: {
        title: title,
        body: text,
      },
    });
  }

  async sendMessage(message: Message, recipientId: number) {
    const recipient = await this.usersService.findOne(recipientId);

    let currentInbox = recipient?.inbox || [];

    await this.usersService.updateUser(recipientId, {
      inbox: [message, ...(recipient?.inbox || [])],
    });
  }

  async sendFriendRequest(user: User, recipientId: number) {
    const recipient = await this.usersService.findOne(recipientId);

    if (!recipient) return 'User does not exist';
    if (
      recipient.inbox.some(
        (mess) =>
          mess.senderId === String(user.id) && mess.type === 'FRIEND_REQUEST',
      )
    )
      return 'Friend request already sent';

    const friendRequestMessage = createFriendRequest(user);

    this.sendMessage(friendRequestMessage as Message, recipientId);

    this.sendNotification({
      data: friendRequestMessage,
      text: friendRequestMessage.text,
      title: friendRequestMessage.title,
      ...(recipient?.fcmToken && { token: recipient.fcmToken }),
    });

    return friendRequestMessage;
  }

  async connectToFCM(fcmToken: string, userId: number) {
    return this.usersService.updateUser(userId, { fcmToken });
  }

  async deleteMessage(userId: number, id: string) {
    const user = await this.usersService.findOne(userId);

    const updatedInbox = user.inbox.filter((message) => message.id !== id);

    return await this.usersService.updateUser(userId, { inbox: updatedInbox });
  }

  async respondToFriendRequest(
    user: User,
    message: Message,
    response: boolean,
  ) {
    const currentUser = await this.usersService.findOne(user.id);
    const sender = await this.usersService.findOne(Number(message.senderId));

    if (response) {
      await this.usersService.updateUser(user.id, {
        inbox: currentUser.inbox.filter((m) => m.id !== message.id),
        friends: (currentUser?.friends || []).concat([sender]),
      });
      await this.usersService.updateUser(Number(message.senderId), {
        friends: (sender?.friends || []).concat([currentUser]),
      });
    }

    this.deleteMessage(user.id, message.id);
  }

  async readMessage(userId: number, id: string) {
    const user = await this.usersService.findOne(userId);

    const currentMessages = user.inbox;
    const updatedMessages = currentMessages.map((m) =>
      m.id === id
        ? {
            ...m,
            read: 'true',
          }
        : m,
    );

    this.usersService.updateUser(userId, { inbox: updatedMessages });
  }
}
