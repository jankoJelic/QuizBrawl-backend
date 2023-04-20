import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { scrypt as _scrypt } from 'crypto';
import { CreateUserDto } from './dtos/create-user.dto';
import { SignInDto } from './dtos/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import { entryMatchesHash, hashAndSalt } from './util/hashAndSalt';
import { MailService } from 'src/mail/mail.service';
import { createOtpCode } from './util/createOtpCode';
import { User } from './user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { email, password, firstName } = createUserDto;
    const user = await this.usersService.findByEmail(email);

    if (user) throw new BadRequestException('Email in use');

    const hashedPassword = await hashAndSalt(password);

    const refreshToken = await this.jwtService.signAsync({
      email,
      refresh: true,
    });
    const hashedRefreshToken = await hashAndSalt(refreshToken);

    const registrationOtpCode = createOtpCode();

    const newUser = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
      refreshToken: hashedRefreshToken,
      registrationOtpCode,
    });

    const accessToken = await this.jwtService.signAsync({
      email,
      id: newUser.id,
      refreshToken,
    });

    this.mailService.sendUserConfirmation(createUserDto, registrationOtpCode);

    return accessToken;
  }

  async login(signInDto: SignInDto) {
    const { email, password } = signInDto;
    const user = await this.usersService.findByEmail(email);

    if (!user) throw new NotFoundException('user not found');

    const passwordIsCorrect = await entryMatchesHash(password, user.password);

    if (!passwordIsCorrect) throw new BadRequestException('bad password');

    const { accessToken } = await this.createNewTokens(user);

    return accessToken;
  }

  async updateRefreshToken(refreshToken: string, email: string) {
    const user = await this.usersService.findByEmail(email);

    const refreshTokenMatchesHash = await entryMatchesHash(
      refreshToken,
      user.refreshToken,
    );

    if (!refreshTokenMatchesHash) throw new UnauthorizedException();

    const { accessToken } = await this.createNewTokens(user);

    return accessToken;
  }

  async createNewTokens(user: User) {
    let securedUserObject = user;
    delete securedUserObject.refreshToken;
    delete securedUserObject.password;
    delete securedUserObject.registrationOtpCode;
    delete securedUserObject.updatedAt;

    const refreshToken = await this.jwtService.signAsync({
      user: securedUserObject,
    });
    const accessToken = await this.jwtService.signAsync({
      user: securedUserObject,
    });

    const hashedRefreshToken = await hashAndSalt(refreshToken);

    this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

    return { refreshToken, accessToken };
  }
}
