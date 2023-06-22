import { Injectable } from '@nestjs/common';
import { User } from 'src/auth/user.entity';
import { UsersService } from 'src/auth/users.service';
import admin from 'firebase-admin';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { CreateMessageDto, MessageType } from './dtos/message.dto';
import { LeaguesService } from 'src/leagues/leagues.service';

const jankosToken =
  'c8rpPv3URoO1tshuI60Sqt:APA91bHOek1ojK8oUlX5a8yk594RK2Qpf-_Eo2XEFddw9uT_bscRxak7EjKix2w8p-V4S49lJH_Hi1--aDMYS8qi9n2CLWDBtB3LA88alGSZ-H8MOfKytM57UgGo3uQq-xfA9sgevLqf';

@Injectable()
export class MessagesService {
  constructor(
    private usersService: UsersService,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    private leaguesService: LeaguesService,
  ) {}

  sendNotification({ data, title, text, token = jankosToken }) {
    admin.messaging().send({
      // token: recipient.fcmToken,
      // hardcoded my phone for testing, needs to be equal to recipient?.fcmToken
      token,
      // data,
      notification: {
        title: title,
        body: text,
      },
    });
  }

  async getMyMessages(userId: number) {
    return await this.messagesRepository.find({
      where: { recipientId: userId },
    });
  }

  async sendMessage(message: CreateMessageDto) {
    return await this.messagesRepository.save(message);
  }

  async sendFriendRequest(user: User, recipientId: number) {
    const senderFullName = `${user.firstName} ${user.lastName}`;
    const recipientMessages = await this.messagesRepository.find({
      where: { recipientId },
    });
    const recipient = await this.usersService.findOne(recipientId);

    if (
      recipientMessages.some(
        (mess) => mess.senderId === user.id && mess.type === 'FRIEND_REQUEST',
      )
    )
      return 'Friend request already sent';

    const friendRequestMessage = {
      recipientId,
      title: `${senderFullName} sent you a friend request`,
      text: 'Click here to accept',
      senderId: user.id,
      type: 'FRIEND_REQUEST' as MessageType,
      payload: {},
    };

    await this.sendMessage(friendRequestMessage);

    this.sendNotification({
      data: 'FRIEND_REQUEST',
      text: friendRequestMessage.text,
      title: friendRequestMessage.title,
      ...(recipient?.fcmToken && { token: recipient.fcmToken }),
    });

    return friendRequestMessage;
  }

  async connectToFCM(fcmToken: string, userId: number) {
    return this.usersService.updateUser(userId, { fcmToken });
  }

  async deleteMessage(id: number) {
    return await this.messagesRepository.delete(id);
  }

  readMessage(id: number) {
    this.messagesRepository.update(id, { read: true });
  }
}
