import { Injectable } from '@nestjs/common';
import { Message } from 'src/messages/dtos/message.dto';
import { User } from 'src/auth/user.entity';
import { UsersService } from 'src/auth/users.service';
import admin from 'firebase-admin';

@Injectable()
export class MessagesService {
  constructor(private usersService: UsersService) {}

  async sendFriendRequest(user: User, recipientId: number) {
    const recipient = await this.usersService.findOne(recipientId);

    if (!recipient) throw new Error('User does not exist');

    const friendRequestMessage = {
      title: `${user?.firstName} ${user?.lastName} sent you a friend request`,
      type: 'FRIEND_REQUEST',
      createdAt: String(new Date().getTime()),
      senderId: String(user.id),
      read: 'false',
    };

    await this.usersService.updateUser(recipientId, {
      inbox: [friendRequestMessage as Message, ...(recipient?.inbox || [])],
    });

    admin.messaging().send({
      // token: recipient.fcmToken,
      token:
        'c8rpPv3URoO1tshuI60Sqt:APA91bHOek1ojK8oUlX5a8yk594RK2Qpf-_Eo2XEFddw9uT_bscRxak7EjKix2w8p-V4S49lJH_Hi1--aDMYS8qi9n2CLWDBtB3LA88alGSZ-H8MOfKytM57UgGo3uQq-xfA9sgevLqf',
      data: friendRequestMessage,
      notification: { title: friendRequestMessage.title },
    });

    console.log('sent');

    return friendRequestMessage;
  }

  async connectToFCM(fcmToken: string, userId: number) {
    return this.usersService.updateUser(userId, { fcmToken });
  }
}
