import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { SignInDto } from './dtos/sign-in.dto';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { JWT_SECRET } from './constants/authConstants';
import { Public } from './decorators/public.decorator';
import { GetRefreshToken } from './decorators/get-refresh-token.decorator';
import { AdminGuard } from './guards/admin.guard';
import { MailService } from 'src/mail/mail.service';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from './decorators/current-user.decorator';
import { PinDto } from './dtos/pin.dto';
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
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

    delete user.password;
    delete user.refreshToken;

    return user;
  }

  @Public()
  @Get('/refreshToken')
  async refreshToken(
    @CurrentUser() user: User,
    @GetRefreshToken() refreshToken: string,
  ) {
    return await this.authService.updateRefreshToken(refreshToken, user.email);
  }

  @UseGuards(AdminGuard)
  @Delete('')
  deleteUser(@Query('id') id: string) {
    this.usersService.deleteUser(id);
    return `deleted user ${id}`;
  }

  @Post('/confirmEmail')
  async confirmEmail(@Body() otpCode: string, @CurrentUser() user: User) {
    this.usersService.confirmEmail(otpCode, user.id);

    return 'email confirmed';
  }

  @Public()
  @Get('/testemail')
  testEmail() {
    this.mailService.sendUserConfirmation(
      { email: 'janko.jelic99@gmail.com', firstName: 'Janko' } as CreateUserDto,
      '123321',
    );
  }

  @Patch('/updateUser')
  async updateUser(@CurrentUser() user: User, @Body() body: Partial<User>) {
    this.usersService.updateUser(user.id, body);
  }

  @Public()
  @Post('/pin')
  async setPinCode(@Body() body: PinDto) {
    return await this.authService.getPinEncryptionKey(body);
  }
}
