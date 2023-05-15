import { Injectable } from '@nestjs/common';
import { Message } from 'src/messages/dtos/message.dto';
import { User } from 'src/auth/user.entity';
import { UsersService } from 'src/auth/users.service';

@Injectable()
export class MessagesService {
  constructor(private usersService: UsersService) {}

  async sendFriendRequest(user: User, recipientId: number) {
    const recipient = await this.usersService.findOne(recipientId);

    if (!recipient) throw new Error('User does not exist');

    const friendRequestMessage = {
      title: `${user?.firstName} ${user?.lastName} sent you a friend request`,
      type: 'FRIEND_REQUEST',
      createdAt: new Date().getTime(),
      senderId: user.id,
      read: false,
    };

    await this.usersService.updateUser(recipientId, {
      inbox: [friendRequestMessage as Message, ...(recipient?.inbox || [])],
    });

    return friendRequestMessage;
  }
}
