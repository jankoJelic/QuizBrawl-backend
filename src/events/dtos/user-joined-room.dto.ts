import { User } from 'src/auth/user.entity';

export interface UserJoinedRoomDto {
  roomId: number;
  user: User;
}
