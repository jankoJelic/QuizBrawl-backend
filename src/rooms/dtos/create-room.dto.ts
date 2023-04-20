import { Topic } from 'src/rooms/types/Topic';
import { GameType } from '../types/GameType';

export interface CreateRoomDto {
  name: string;
  topic: Topic;
  answerTime: number;
  createdBy: number;
  maxPlayers: number;
  type: GameType;
  userId: number;
  hostName?: string;
}
