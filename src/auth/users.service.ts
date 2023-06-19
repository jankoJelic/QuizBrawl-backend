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
import { shallowUser } from './util/shallowUser';
import { getStorage } from 'firebase-admin/storage';
import { createStorageDownloadUrl } from 'src/util/firebase/createStorageDownloadUrl';
import { ConfigService } from '@nestjs/config';
import { Topic } from 'src/rooms/types/Topic';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Lobby)
    private lobbiesRepository: Repository<Lobby>,
    @InjectRepository(Room)
    private roomsRepository: Repository<Room>,
    private configService: ConfigService,
  ) {}

  initialAnswers() {
    return {
      General: 0,
      Sports: 0,
      Music: 0,
      History: 0,
      Geography: 0,
      Showbiz: 0,
      Art: 0,
      Science: 0,
    };
  }

  async create(createUserDto: CreateUserDto) {
    const defaultAvatars = await this.getDefaultAvatars();
    const randomDefaultAvatar =
      defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];

    const user = this.usersRepository.create({
      ...createUserDto,
      avatar: randomDefaultAvatar,
      correctAnswers: this.initialAnswers(),
      totalAnswers: this.initialAnswers(),
      leagueIds: [-1],
    });
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

  async findById(userId: number) {
    return shallowUser(
      await this.usersRepository.findOne({ where: { id: userId } }),
    );
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

  async makeFriends(userOneId: number, userTwoId: number) {
    const userOne = await this.findOne(userOneId);
    const userTwo = await this.findOne(userTwoId);

    if (userOne.friends.map((fr) => Number(fr)).includes(userTwo.id)) return;

    this.updateUser(userOneId, {
      friends: (userOne?.friends || []).concat([userTwoId]),
    });

    this.updateUser(userTwoId, {
      friends: (userTwo?.friends || []).concat([userOneId]),
    });
  }

  async removeFriends(userOneId: number, userTwoId: number) {
    const userOne = await this.findOne(userOneId);
    const userTwo = await this.findOne(userTwoId);

    this.updateUser(userOneId, {
      friends: userOne.friends.filter((friendId) => friendId != userTwoId),
    });

    this.updateUser(userTwoId, {
      friends: userTwo.friends.filter((friendId) => friendId != userOneId),
    });
  }

  async getDefaultAvatars() {
    const bucket = await getStorage()
      .bucket()
      .getFiles({ prefix: 'avatars/default' });
    const allUrls = bucket[0].map((file) =>
      createStorageDownloadUrl(
        file.name,
        this.configService.get('FIREBASE_TOKEN'),
      ),
    );
    return allUrls;
  }

  async getUserAvatars(userId: number) {
    const defaultAvatars = await this.getDefaultAvatars();
    const user = await this.findOne(userId);
    const availableAvatars = (user.avatars || []).concat(
      defaultAvatars.filter((url) => url.includes('.png')),
    );
    return availableAvatars;
  }

  async removeFriend(friendId: number, currentUser: User) {
    this.usersRepository.update(currentUser.id, {
      friends: currentUser?.friends?.filter((fr) => fr != friendId) || [],
    });
  }

  async getUsers(userIds: number[]) {
    let friends = [];

    for (let i = 0; i < userIds.length; i++) {
      const user = await this.usersRepository.findOne({
        where: {
          id: userIds[0],
        },
      });

      friends.push(user);
    }
    return friends.map((fr) => shallowUser(fr));
  }

  async registerAnswer(user: User, correct: boolean, topic: Topic) {
    const myUser = await this.findOne(user.id);

    let updatedCorrectAnswers = myUser.correctAnswers || this.initialAnswers();

    if (correct)
      updatedCorrectAnswers[topic] = updatedCorrectAnswers[topic] + 1;

    let updatedTotalAnswers = myUser.totalAnswers || this.initialAnswers();
    updatedTotalAnswers[topic] = updatedTotalAnswers[topic] + 1;

    this.updateUser(user.id, {
      ...(correct && {
        correctAnswers: {
          ...updatedCorrectAnswers,
        },
      }),
      totalAnswers: updatedTotalAnswers,
    });
  }

  async getLeaderboards() {
    const players = await this.usersRepository
      .find({
        order: {
          trophies: {
            direction: 'DESC',
          },
        },
        take: 100,
      })
      .then((res) => res.map((u) => shallowUser(u)));

    return players;
  }
}
