import { Controller, Get, NotFoundException, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags } from '@nestjs/swagger';
import { shallowUser } from './util/shallowUser';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from './user.entity';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
  ) {}

  @Get('/')
  async getAllUsers(
    @Query('isAdmin') isAdmin: string,
    @Query('name') name: string,
  ) {
    const isAdminBoolean = isAdmin === 'true';
    return await this.usersService.findAll(name, isAdminBoolean);
  }

  @Get('/user')
  async getUser(@Query('id') id: string) {
    const user = await this.usersService.findOne(Number(id));

    if (!user) throw new NotFoundException();

    return shallowUser(user);
  }

  @Get('/avatars')
  async getDefaultAvatars(@CurrentUser() user: User) {
    return await this.usersService.getUserAvatars(user.id);
  }
}
