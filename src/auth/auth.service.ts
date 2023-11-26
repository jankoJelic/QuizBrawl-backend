import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { scrypt as _scrypt, createHash } from 'crypto';
import { CreateUserDto } from './dtos/create-user.dto';
import { SignInDto } from './dtos/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import { entryMatchesHash, hashAndSalt } from './util/hashAndSalt';
// import { MailService } from 'src/mail/mail.service';
import { createOtpCode } from './util/createOtpCode';
import { User } from './user.entity';
import { PinDto } from './dtos/pin.dto';
import { ConfigService } from '@nestjs/config';
import { GoogleAuthDto } from './dtos/google-auth.dto';
import { shallowUser } from './util/shallowUser';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    // private mailService: MailService,
    private configService: ConfigService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;
    const user = await this.usersService.findByEmail(email);

    if (user) throw new BadRequestException('Email in use');

    const hashedPassword = await hashAndSalt(password);

    const refreshToken = await this.jwtService.signAsync({
      user: {
        email,
        refresh: true,
      },
    });
    const hashedRefreshToken = await hashAndSalt(refreshToken);

    const registrationOtpCode = createOtpCode();

    // const defaultAvatars = await this.usersService.getDefaultAvatars();
    const newUser = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
      refreshToken: hashedRefreshToken,
      registrationOtpCode,
    });

    const accessToken = await this.jwtService.signAsync({
      user: {
        email,
        id: newUser.id,
        refreshToken,
      },
    });

    // this.mailService.sendUserConfirmation(createUserDto, registrationOtpCode);

    return { accessToken, refreshToken };
  }

  async login(signInDto: SignInDto) {
    const { email, password } = signInDto;
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException('user not found');

    const passwordIsCorrect = await entryMatchesHash(password, user.password);
    if (!passwordIsCorrect) throw new BadRequestException('bad password');

    const { accessToken, refreshToken } = await this.createNewTokens(user);

    return { accessToken, refreshToken };
  }

  async updateRefreshToken(sentRefreshToken: string, email: string) {
    const user = await this.usersService.findByEmail(email);

    const refreshTokenMatchesHash = await entryMatchesHash(
      sentRefreshToken,
      user.refreshToken,
    );

    if (!refreshTokenMatchesHash) throw new UnauthorizedException();

    const { accessToken, refreshToken } = await this.createNewTokens(user);

    return { accessToken, refreshToken };
  }

  async createNewTokens(user: User) {
    const securedUserObject: Partial<User> = shallowUser(user);

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

  async getPinEncryptionKey(dto: PinDto) {
    const pinKey = this.configService.get<string>('APP_PIN_KEY');
    const salt = `${dto.pin}-${pinKey}-${dto.deviceId}`;
    return createHash('sha256').update(salt, 'utf8').digest().toString('hex');
  }

  async handleGoogleAuth({ email, name, photo }: GoogleAuthDto) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      const user = await this.usersService.create({
        email,
        firstName: name.split(' ')[0],
        lastName: name.split(' ')[1],
        password: '19431d738be0dcdcf3a1e31298e56b3f8236a147',
        ...(!!photo && { avatar: photo, avatars: [photo] }),
      });

      const { accessToken, refreshToken } = await this.createNewTokens(user);

      return { accessToken, refreshToken };
    } else {
      const { accessToken, refreshToken } = await this.createNewTokens(user);

      return { accessToken, refreshToken };
    }
  }

  async deleteMyAccount(email: string, password: string, userId: number) {
    const { accessToken } = await this.login({ email, password });
    if (accessToken) {
      this.usersService.deleteUser(String(userId));
      return true;
    } else {
      return false;
    }
  }
}
