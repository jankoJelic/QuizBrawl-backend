export interface Message {
  type: MessageType;
  title: string;
  text?: string;
  createdAt: number;
  payload?: any;
  read: boolean;
}

export type MessageType = 'REWARD' | 'GAME_INVITE' | 'FRIEND_REQUEST';
