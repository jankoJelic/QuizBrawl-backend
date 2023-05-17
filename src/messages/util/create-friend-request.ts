import { User } from 'src/auth/user.entity';
import { v4 } from 'uuid';

export const createFriendRequest = (currentUser: User) => {
  return {
    title: `${currentUser?.firstName} ${currentUser?.lastName} sent you a friend request`,
    text: 'Click here to accept',
    type: 'FRIEND_REQUEST',
    createdAt: String(new Date().getTime()),
    senderId: String(currentUser.id),
    read: 'false',
    id: v4(),
  };
};
