import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dtos/create-room.dto';

@Controller('rooms')
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  @Get('/')
  async getAllRooms() {
    return this.roomsService.getAll();
  }

  @Post('/create')
  async createRoom(@Req() req, @Body() body: CreateRoomDto) {
    const { user } = req || {};

    const room = await this.roomsService.createRoom({
      userId: user.id,
      ...body,
    });

    return room;
  }

  @Delete('/delete')
  async deleteRoom(@Req() req, @Query() roomId: number) {
    const { user } = req || {};
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
