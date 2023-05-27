import { Topic } from 'src/rooms/types/Topic';
import { User } from 'src/auth/user.entity';

export interface CreateRoomDto {
  name: string;
  topic: Topic;
  answerTime: number;
  maxPlayers: number;
  lobbyId: number;
  users: User[];
  questionsCount?: number;
  readyUsers?: string[];
  gameStarted?: boolean;
  hostName: string;
}
