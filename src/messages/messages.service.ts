import { Injectable } from '@nestjs/common';
import { User } from 'src/auth/user.entity';
import { UsersService } from 'src/auth/users.service';
import admin from 'firebase-admin';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { CreateMessageDto, MessageType } from './dtos/message.dto';

@Injectable()
export class MessagesService {
  constructor(
    private usersService: UsersService,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  sendNotification({ title, text, token, data = { type: '', payload: '0' } }) {
    const payload = {
      data,
      notification: {
        title: title,
        body: text,
      },
    };
    if (typeof token === 'string') {
      admin.messaging().send({
        token,
        ...payload,
      });
    } else {
      admin.messaging().sendMulticast({ tokens: token as string[] });
    }
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
      data: { type: 'FRIEND_REQUEST', payload: String(user.id) },
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

interface MessageData {
  type: MessageType;
  payload: string; // mostly a stringified ID (notifications don't accept numbers)
}
