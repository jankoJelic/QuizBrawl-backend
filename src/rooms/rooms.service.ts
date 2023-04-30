import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from './room.entity';
import { Repository } from 'typeorm';
import { CreateRoomDto } from './dtos/create-room.dto';
import { User } from 'src/auth/user.entity';
import { Topic } from './types/Topic';

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
    this.roomsRepository.delete(roomId);
  }

  async getRoomById(roomId: number) {
    return await this.roomsRepository.findOneBy({ id: roomId });
  }

  async updateRoom(createRoomDto: Partial<CreateRoomDto> & { roomId: number }) {
    const { roomId } = createRoomDto;

    delete createRoomDto.roomId;

    return await this.roomsRepository.update(roomId, createRoomDto);
  }

  async getAll(lobbyId?: number, topic?: Topic) {
    const allRooms = await this.roomsRepository.find({ relations: ['lobby'] });
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

  async getAllForTopic(topic: Topic) {}
}
