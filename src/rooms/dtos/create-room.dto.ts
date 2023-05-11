import { Topic } from 'src/rooms/types/Topic';
import { Lobby } from 'src/lobbies/lobby.entity';
import { User } from 'src/auth/user.entity';

export interface CreateRoomDto {
  name: string;
  topic: Topic;
  answerTime: number;
  maxPlayers: number;
  lobby: Lobby;
  users: User[];
  admin: User;
  questionsCount?: number;
  readyUsers?: string[]
}
