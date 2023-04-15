import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { User } from './user.entity';
import { AuthService } from './auth.service';

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
}
