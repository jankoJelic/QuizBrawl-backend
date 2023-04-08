import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { User } from './user.entity';
import { entryMatchesHash } from './util/hashAndSalt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async findByEmail(email: string) {
    try {
      const users = await this.usersRepository.find({ where: { email } });

      if (!users.length) throw new NotFoundException();

      return users[0];
    } catch (e) {}
  }

  async updateRefreshToken(refreshToken: string, email: string) {
    const user = await this.findByEmail(email);

    const refreshTokenMatchesHash = await entryMatchesHash(
      refreshToken,
      user.refreshToken,
    );

    if (!refreshTokenMatchesHash) throw new UnauthorizedException();

    // return await this.usersRepository.update(userId, {
    //   refreshToken: currentHashedRefreshToken,
    // });
  }
}
