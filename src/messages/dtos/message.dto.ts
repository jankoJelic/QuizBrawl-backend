export class CreateMessageDto {
  type: MessageType;
  title: string;
  text?: string;
  payload?: any;
  senderId: number;
  recipientId: number;
}

export type MessageType =
  | 'REWARD'
  | 'GAME_INVITE'
  | 'FRIEND_REQUEST'
  | 'JOIN_LEAGUE_REQUEST';
