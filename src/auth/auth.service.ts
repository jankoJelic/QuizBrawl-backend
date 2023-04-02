import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { CreateUserDto } from './dtos/create-user.dto';
import { SignInDto } from './dtos/sign-in-dto';
import { JwtService } from '@nestjs/jwt';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;
    const user = await this.usersService.findByEmail(email);

    if (user) throw new BadRequestException('Email in use');

    // hash the user's password
    // Generate a salt
    const salt = randomBytes(8).toString('hex');

    // Hash the password with the salt
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    // Join the hashed password with the salt
    const result = salt + '.' + hash.toString('hex');

    // create a new user and save it to the database
    const newUser = await this.usersService.create({
      ...createUserDto,
      password: result,
    });

    return { ...newUser, password: 'SECURED' };
  }

  async signin(signInDto: SignInDto) {
    const { email, password } = signInDto;
    const user = await this.usersService.findByEmail(email);

    if (!user) throw new NotFoundException('user not found');

    const [salt, storedHash] = user.password.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('bad password');
    }

    const accessToken = this.jwtService.sign({ email });
    return { accessToken };
  }
}
