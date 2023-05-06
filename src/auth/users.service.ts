import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { User } from './user.entity';
import { UserJoinedLobbyDto } from 'src/events/dtos/user-joined-lobby.dto';
import { Lobby } from 'src/lobbies/lobby.entity';
import { UserJoinedRoomDto } from 'src/events/dtos/user-joined-room.dto';
import { Room } from 'src/rooms/room.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Lobby)
    private lobbiesRepository: Repository<Lobby>,
    @InjectRepository(Room)
    private roomsRepository: Repository<Room>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findAll(name?: string, isAdmin?: boolean): Promise<User[]> {
    const builder = this.usersRepository.createQueryBuilder('user');
    builder
      .where('user.email LIKE :name', { name: `%${name}%` })
      .andWhere('user.isAdmin LIKE :isAdmin', { isAdmin });

    return await builder.getMany();
  }

  findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: { lobby: true, room: true },
    });
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async findByEmail(email: string) {
    try {
      const users = await this.usersRepository.find({
        where: { email },
        relations: { lobby: true, room: true },
      });

      if (!users.length) throw new NotFoundException();

      return users[0];
    } catch (e) {}
  }

  async updateRefreshToken(id: number, hashedToken: string) {
    await this.usersRepository.update(id, {
      refreshToken: hashedToken,
    });
  }

  deleteUser(id: string) {
    this.usersRepository.delete(id);
  }

  async updateUser(id: number, data: Partial<User>) {
    await this.usersRepository.update(id, data);
  }

  async confirmEmail(otpCode: string, id: number) {
    const { registrationOtpCode } = await this.findOne(id);

    if (otpCode !== registrationOtpCode) throw new BadRequestException();

    this.updateUser(id, { isEmailConfirmed: true, registrationOtpCode: '' });
  }

  async addUserToLobby({ lobbyId, user }: UserJoinedLobbyDto) {
    const lobby = await this.lobbiesRepository.findOne({
      where: { id: lobbyId },
    });

    lobby.users = lobby.users.concat([user]);

    await this.usersRepository.update(user.id, { lobby });

    this.lobbiesRepository.save(lobby);
  }

  async removeUserFromLobby(user: User) {
    await this.usersRepository.save({ ...user, lobby: null });
  }

  async addUserToRoom({ roomId, user }: UserJoinedRoomDto) {
    const room = await this.roomsRepository.findOne({ where: { id: roomId } });

    return await this.usersRepository.update(user.id, { room });
  }

  async removeUserFromRoom(user: User) {
    await this.usersRepository.save({ ...user, room: null });
  }
}
