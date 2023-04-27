import { User } from 'src/auth/user.entity';

export interface UserJoinedLobbyDto {
  lobbyId: number;
  user: User;
}
