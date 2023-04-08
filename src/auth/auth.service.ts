import {
  BadRequestException,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { scrypt as _scrypt } from 'crypto';
import { CreateUserDto } from './dtos/create-user.dto';
import { SignInDto } from './dtos/sign-in-dto';
import { JwtService } from '@nestjs/jwt';
import { User } from './user.entity';
import { entryMatchesHash, hashAndSalt } from './util/hashAndSalt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;
    const user = await this.usersService.findByEmail(email);

    if (user) throw new BadRequestException('Email in use');

    const hashedPassword = await hashAndSalt(password);

    const refreshToken = await this.jwtService.signAsync({
      email,
      refresh: true,
    });
    const hashedRefreshToken = await hashAndSalt(refreshToken);

    const newUser = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
      refreshToken: hashedRefreshToken,
    });

    const accessToken = await this.jwtService.signAsync({
      email,
      id: newUser.id,
      refreshToken,
    });

    return { accessToken };
  }

  async login(signInDto: SignInDto) {
    const { email, password } = signInDto;
    const user = await this.usersService.findByEmail(email);

    if (!user) throw new NotFoundException('user not found');

    const passwordIsCorrect = await entryMatchesHash(password, user.password);

    if (!passwordIsCorrect) throw new BadRequestException('bad password');

    const refreshToken = await this.jwtService.signAsync({
      email,
      id: user.id,
      refresh: true,
    });
    const accessToken = await this.jwtService.signAsync({
      email,
      id: user.id,
      refreshToken,
    });

    const hashedRefreshToken = await hashAndSalt(refreshToken);

    this.usersRepository.update(user.id, {
      refreshToken: hashedRefreshToken,
    });

    return { accessToken };
  }

  async refreshToken(context: ExecutionContext) {
    // this.usersService.updateRefreshToken()
  }
}
