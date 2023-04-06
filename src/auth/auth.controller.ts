import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { SignInDto } from './dtos/sign-in-dto';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { JWT_SECRET } from './constants/authConstants';
import { Public } from './decorators/Public.decorator';
@Controller('auth')
export class AuthController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  async isTokenValid(bearerToken: string): Promise<User | null> {
    const verifyOptions = { secret: this.configService.get(JWT_SECRET) };

    try {
      const payload = await this.jwtService.verifyAsync(
        bearerToken,
        verifyOptions,
      );
      const { email } = payload;

      const user = await this.usersService.findByEmail(email);

      if (user) {
        return user;
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.UNAUTHORIZED);
    }

    return null;
  }

  @Public()
  @Post('/register')
  async createUser(@Body() body: CreateUserDto) {
    const user = await this.authService.register(body);

    return user;
  }

  @Public()
  @Post('/login')
  async signIn(@Body() body: SignInDto) {
    return await this.authService.login(body);
  }

  @Get('/users')
  async getAllUsers() {
    return await this.usersService.findAll();
  }

  @Get('/me')
  async getMyInfo(@Headers('Authorization') authorization = '') {
    let bearer: string = '';

    if (typeof authorization != 'undefined') {
      bearer = authorization.replace('Bearer ', '');
    }
    if (bearer === '') {
      throw new UnauthorizedException('No Token provided!');
    }

    const { email } = await this.isTokenValid(bearer);

    const user = await this.usersService.findByEmail(email);
    return { ...user, password: 'SECURED' };
  }
}
