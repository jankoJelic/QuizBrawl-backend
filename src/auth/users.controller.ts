import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags } from '@nestjs/swagger';
import { shallowUser } from './util/shallowUser';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from './user.entity';
import { AdminGuard } from './guards/admin.guard';
import { Topic } from 'src/rooms/types/Topic';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AdminGuard)
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

  @Post('/answer')
  async registerAnswer(
    @CurrentUser() user: User,
    @Body() body: { correct: boolean; topic: Topic },
  ) {
    this.usersService.registerAnswer(user, body.correct, body.topic);
  }

  @Delete('/removeFriend')
  async removeFriend(@CurrentUser() user: User, @Query('id') id: string) {
    return await this.usersService.removeFriend(Number(id), user);
  }

  @Get('/friends')
  async getFriends(@CurrentUser() user: User) {
    if (!user.friends) return;
    return await this.usersService.getUsers(user.friends);
  }

  @Get('/leaderboards')
  async getLeaderboards() {
    return this.usersService.getLeaderboards()
  }
}
