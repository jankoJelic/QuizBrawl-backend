import { IsArray, IsEmail, IsString } from 'class-validator';
import { ApiHideProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @ApiHideProperty()
  refreshToken?: string;

  @ApiHideProperty()
  registrationOtpCode?: string;

  @IsString()
  googleAuthId?: string;

  @IsString()
  appleId?: string;

  @IsString()
  avatar: string;

  @IsArray()
  avatars: string[];
}
