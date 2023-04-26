import { Topic } from 'src/rooms/types/Topic';
import { GameType } from '../types/GameType';
import { Lobby } from 'src/lobbies/lobby.entity';

export interface CreateRoomDto {
  name: string;
  topic: Topic;
  answerTime: number;
  maxPlayers: number;
  lobby: Lobby;
}
