import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from './room.entity';
import { Repository } from 'typeorm';
import { CreateRoomDto } from './dtos/create-room.dto';
import { User } from 'src/auth/user.entity';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private roomsRepository: Repository<Room>,
  ) {}

  async createRoom(body: CreateRoomDto & { userId: number; players: User[] }) {
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

  async getAll() {
    return await this.roomsRepository.find();
  }
}
