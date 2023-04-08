import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { scrypt as _scrypt } from 'crypto';
import { CreateUserDto } from './dtos/create-user.dto';
import { SignInDto } from './dtos/sign-in-dto';
import { JwtService } from '@nestjs/jwt';
import { entryMatchesHash, hashAndSalt } from './util/hashAndSalt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
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

    return accessToken;
  }

  async login(signInDto: SignInDto) {
    const { email, password } = signInDto;
    const user = await this.usersService.findByEmail(email);

    if (!user) throw new NotFoundException('user not found');

    const passwordIsCorrect = await entryMatchesHash(password, user.password);

    if (!passwordIsCorrect) throw new BadRequestException('bad password');

    const { accessToken } = await this.createNewTokens(email, user.id);

    return accessToken;
  }

  async updateRefreshToken(refreshToken: string, email: string) {
    const user = await this.usersService.findByEmail(email);

    const refreshTokenMatchesHash = await entryMatchesHash(
      refreshToken,
      user.refreshToken,
    );

    if (!refreshTokenMatchesHash) throw new UnauthorizedException();

    const { accessToken } = await this.createNewTokens(user.email, user.id);

    return accessToken;
  }

  async createNewTokens(email: string, id: number) {
    const refreshToken = await this.jwtService.signAsync({
      email,
      id,
      refresh: true,
    });
    const accessToken = await this.jwtService.signAsync({
      email,
      id,
      refreshToken,
    });

    const hashedRefreshToken = await hashAndSalt(refreshToken);

    this.usersService.updateRefreshToken(id, hashedRefreshToken);

    return { refreshToken, accessToken };
  }
}
