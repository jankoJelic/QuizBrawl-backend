export interface Message {
  type: MessageType;
  title: string;
  text?: string;
  createdAt: string;
  payload?: {};
  read: string;
}

export type MessageType = 'REWARD' | 'GAME_INVITE' | 'FRIEND_REQUEST';
