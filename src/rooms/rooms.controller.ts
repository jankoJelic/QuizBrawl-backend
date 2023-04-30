import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dtos/create-room.dto';
import { User } from 'src/auth/user.entity';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ApiTags } from '@nestjs/swagger';
import { Topic } from './types/Topic';

@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  @Get('/')
  async getAllRooms(
    @Param('lobbyId') lobbyId: number,
    @Param('topic') topic: Topic,
  ) {
    return this.roomsService.getAll(lobbyId, topic);
  }

  @Post('/create')
  async createRoom(@CurrentUser() user: User, @Body() body: CreateRoomDto) {
    const room = await this.roomsService.createRoom({
      userId: user.id,
      ...body,
      admin: user,
      users: [user],
    });

    return room;
  }

  @Delete('/delete')
  async deleteRoom(@CurrentUser() user: User, @Query() roomId: number) {
    const room = await this.roomsService.getRoomById(roomId);

    if (!room) throw new NotFoundException();

    if (room.userId === user.id) {
      this.roomsService.deleteRoom(roomId);
    } else {
      throw new UnauthorizedException();
    }
  }

  @Patch('/updateRoom')
  async editRoom(@Body() body: Partial<CreateRoomDto> & { roomId: number }) {
    return await this.roomsService.updateRoom(body);
  }
}
