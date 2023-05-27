import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from './room.entity';
import { Repository } from 'typeorm';
import { CreateRoomDto } from './dtos/create-room.dto';
import { User } from 'src/auth/user.entity';
import { Topic } from './types/Topic';
import { LOBBY_IDS } from 'src/lobbies/constants/lobby-ids';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private roomsRepository: Repository<Room>,
  ) {}

  async createRoom(body: CreateRoomDto & { users: User[]; userId: number }) {
    const room = this.roomsRepository.create(body);
    return this.roomsRepository.save(room);
  }

  async deleteRoom(roomId: number) {
    const room = await this.roomsRepository.findOne({ where: { id: roomId } });
    if (room?.lobbyId === LOBBY_IDS.SOLO) return "can't delete solo event";
    return await this.roomsRepository.delete(roomId);
  }

  async getRoomById(roomId: number) {
    return await this.roomsRepository.findOne({ where: { id: roomId } });
  }

  async updateRoom(createRoomDto: Partial<CreateRoomDto> & { roomId: number }) {
    const { roomId } = createRoomDto;

    delete createRoomDto.roomId;

    return await this.roomsRepository.update(roomId, createRoomDto);
  }

  async getAll(lobbyId?: number, topic?: Topic) {
    const allRooms = await this.roomsRepository.find();
    let rooms = allRooms;

    if (!!lobbyId) {
      const lobbyRooms = allRooms.filter((room) => room.lobby.id === lobbyId);
      rooms = lobbyRooms;
    }
    if (!!topic) {
      const topicRooms = rooms.filter((r) => r.topic === topic);
      rooms = topicRooms;
    }

    return rooms;
  }

  async getAllForUser(userId: number) {
    return await this.roomsRepository.findOne({ where: { userId } });
  }
}
