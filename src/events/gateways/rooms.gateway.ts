import { UsersService } from 'src/auth/users.service';
import { EventsGateway } from '../events.gateway';
import { RoomsService } from 'src/rooms/rooms.service';
import { SOCKET_EVENTS } from '../constants/events';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { QuestionsService } from 'src/questions/questions.service';
import { MessagesService } from 'src/messages/messages.service';
import { RewardsService } from 'src/rewards/rewards.service';
import { UserJoinedRoomDto } from '../dtos/user-joined-room.dto';
import { roomName } from '../util/create-room-name';
import { Room } from 'src/rooms/room.entity';
import { UserReadyDto } from '../dtos/user-ready.dto';
import { LeaguesService } from 'src/leagues/leagues.service';

export class RoomsGateway extends EventsGateway {
  constructor(
    usersService: UsersService,
    roomsService: RoomsService,
    questionsService: QuestionsService,
    messagesService: MessagesService,
    rewardsService: RewardsService,
    leaguesService: LeaguesService,
  ) {
    super(
      usersService,
      roomsService,
      questionsService,
      messagesService,
      rewardsService,
      leaguesService,
    );
  }

  @SubscribeMessage(SOCKET_EVENTS.USER_JOINED_ROOM)
  async handleUserJoinedRoom(
    @MessageBody() data: UserJoinedRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    const room = await this.roomsService.getRoomById(data.roomId);
    this.usersService.updateUser(data.user.id, { room });
    this.server.emit(SOCKET_EVENTS.USER_JOINED_ROOM, data);

    client.join(roomName(room.id));
  }

  @SubscribeMessage(SOCKET_EVENTS.USER_LEFT_ROOM)
  async handleUserLeftRoom(
    @MessageBody() { room, user },
    @ConnectedSocket() client: any,
  ) {
    this.usersService.updateUser(user.id, { room: null });
    this.server.emit(SOCKET_EVENTS.USER_LEFT_ROOM, { user, room });

    if (room.users.length === 1) {
      this.roomsService.deleteRoom(room.id);
      this.server.emit(SOCKET_EVENTS.ROOM_DELETED, room);
    }

    client.leave(roomName(room.id));
  }

  @SubscribeMessage(SOCKET_EVENTS.KICK_USER_FROM_ROOM)
  async handleUserKickedFromRoom(@MessageBody() { user, room }) {
    await this.usersService.updateUser(user?.id, { room: null });
    this.server.emit(SOCKET_EVENTS.KICK_USER_FROM_ROOM, { user, room });
  }

  @SubscribeMessage(SOCKET_EVENTS.ROOM_CREATED)
  async handleRoomCreated(
    @MessageBody() room: Room,
    @ConnectedSocket() client: any,
  ) {
    const { userId } = client.handshake.query || {};
    this.usersService.updateUser(userId, { room });
    this.server.emit(SOCKET_EVENTS.ROOM_CREATED, room);

    client.join(roomName(room.id));
  }

  @SubscribeMessage(SOCKET_EVENTS.ROOM_DELETED)
  async handleRoomDeleted(@MessageBody() room: Room) {
    this.server.emit(SOCKET_EVENTS.ROOM_DELETED, room);
  }

  @SubscribeMessage(SOCKET_EVENTS.USER_READY)
  async handleUserReady(
    @MessageBody() { isReady, userId, roomId }: UserReadyDto,
  ) {
    if (isReady) {
      const room = await this.roomsService.getRoomById(roomId);
      if (!room) return;

      this.roomsService.updateRoom({
        roomId,
        readyUsers: [...room.readyUsers, String(userId)],
      });

      this.server.emit(SOCKET_EVENTS.USER_READY, { roomId, userId });
    } else {
    }
  }
}
